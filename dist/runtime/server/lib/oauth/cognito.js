import { defu } from "defu";
import { eventHandler, getQuery, sendRedirect } from "h3";
import { discovery } from "openid-client";
import { withQuery } from "ufo";
import { getOAuthRedirectURL, handleAccessTokenErrorResponse, handleMissingConfiguration, requestAccessToken } from "../utils.js";
import { useRuntimeConfig } from "#imports";
export function defineOAuthCognitoEventHandler({ config, onSuccess, onError }) {
  return eventHandler(async (event) => {
    config = defu(config, useRuntimeConfig(event).oauth?.cognito, {
      authorizationParams: {}
    });
    if (!config.clientId || !config.clientSecret || !config.userPoolId || !config.region) {
      return handleMissingConfiguration(event, "cognito", ["clientId", "clientSecret", "userPoolId", "region"], onError);
    }
    const congitoDiscoveryUrl = new URL(`https://cognito-idp.${config.region}.amazonaws.com/${config.userPoolId}/.well-known/openid-configuration`);
    const issuer = await discovery(congitoDiscoveryUrl, config.clientId, config.clientSecret);
    const {
      authorization_endpoint: authorizationURL,
      token_endpoint: tokenURL,
      userinfo_endpoint: userinfoURL,
      // TODO: implement logout
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      end_session_endpoint: logoutURL
    } = issuer.serverMetadata();
    const query = getQuery(event);
    const redirectURL = config.redirectURL || getOAuthRedirectURL(event);
    if (!query.code) {
      config.scope = config.scope || ["openid", "profile"];
      return sendRedirect(
        event,
        withQuery(authorizationURL, {
          client_id: config.clientId,
          redirect_uri: redirectURL,
          response_type: "code",
          scope: config.scope.join(" "),
          ...config.authorizationParams
        })
      );
    }
    const tokens = await requestAccessToken(
      tokenURL,
      {
        body: {
          grant_type: "authorization_code",
          client_id: config.clientId,
          client_secret: config.clientSecret,
          redirect_uri: redirectURL,
          code: query.code
        }
      }
    );
    if (tokens.error) {
      return handleAccessTokenErrorResponse(event, "cognito", tokens, onError);
    }
    const tokenType = tokens.token_type;
    const accessToken = tokens.access_token;
    const user = await $fetch(userinfoURL, {
      headers: {
        Authorization: `${tokenType} ${accessToken}`
      }
    });
    return onSuccess(event, {
      tokens,
      user
    });
  });
}
