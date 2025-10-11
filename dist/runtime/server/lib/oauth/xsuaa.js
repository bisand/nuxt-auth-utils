import { eventHandler, getQuery, sendRedirect } from "h3";
import { withQuery } from "ufo";
import { defu } from "defu";
import { handleMissingConfiguration, handleAccessTokenErrorResponse, getOAuthRedirectURL, requestAccessToken } from "../utils.js";
import { useRuntimeConfig } from "#imports";
export function defineOAuthXSUAAEventHandler({ config, onSuccess, onError }) {
  return eventHandler(async (event) => {
    config = defu(config, useRuntimeConfig(event).oauth?.xsuaa);
    const query = getQuery(event);
    if (!config.clientId || !config.clientSecret || !config.domain) {
      return handleMissingConfiguration(event, "xsuaa", ["clientId", "clientSecret", "domain"], onError);
    }
    const authorizationURL = `https://${config.domain}/oauth/authorize`;
    const tokenURL = `https://${config.domain}/oauth/token`;
    const redirectURL = config.redirectURL || getOAuthRedirectURL(event);
    if (!query.code) {
      config.scope = config.scope || [];
      return sendRedirect(
        event,
        withQuery(authorizationURL, {
          response_type: "code",
          client_id: config.clientId,
          redirect_uri: redirectURL,
          scope: config.scope.join(" ")
        })
      );
    }
    const tokens = await requestAccessToken(tokenURL, {
      body: {
        grant_type: "authorization_code",
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: redirectURL,
        code: query.code
      }
    });
    if (tokens.error) {
      return handleAccessTokenErrorResponse(event, "xsuaa", tokens, onError);
    }
    const tokenType = tokens.token_type;
    const accessToken = tokens.access_token;
    const user = await $fetch(`https://${config.domain}/userinfo`, {
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
