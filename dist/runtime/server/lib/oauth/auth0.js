import { eventHandler, getQuery, sendRedirect } from "h3";
import { withQuery } from "ufo";
import { defu } from "defu";
import { handleMissingConfiguration, handleAccessTokenErrorResponse, getOAuthRedirectURL, requestAccessToken } from "../utils.js";
import { useRuntimeConfig } from "#imports";
export function defineOAuthAuth0EventHandler({ config, onSuccess, onError }) {
  return eventHandler(async (event) => {
    config = defu(config, useRuntimeConfig(event).oauth?.auth0, {
      authorizationParams: {}
    });
    if (!config.clientId || !config.clientSecret || !config.domain) {
      return handleMissingConfiguration(event, "auth0", ["clientId", "clientSecret", "domain"], onError);
    }
    const authorizationURL = `https://${config.domain}/authorize`;
    const tokenURL = `https://${config.domain}/oauth/token`;
    const query = getQuery(event);
    const redirectURL = config.redirectURL || getOAuthRedirectURL(event);
    if (query.error) {
      return handleAccessTokenErrorResponse(
        event,
        "auth0",
        {
          error: query.error,
          error_description: query.error_description
        },
        onError
      );
    }
    if (!query.code) {
      config.scope = config.scope || ["openid", "offline_access"];
      if (config.emailRequired && !config.scope.includes("email")) {
        config.scope.push("email");
      }
      return sendRedirect(
        event,
        withQuery(authorizationURL, {
          response_type: "code",
          client_id: config.clientId,
          redirect_uri: redirectURL,
          scope: config.scope.join(" "),
          audience: config.audience || "",
          max_age: config.maxAge || 0,
          connection: config.connection || "",
          ...config.authorizationParams
        })
      );
    }
    const tokens = await requestAccessToken(tokenURL, {
      headers: {
        "Content-Type": "application/json"
      },
      body: {
        grant_type: "authorization_code",
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: redirectURL,
        code: query.code
      }
    });
    if (tokens.error) {
      return handleAccessTokenErrorResponse(event, "auth0", tokens, onError);
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
