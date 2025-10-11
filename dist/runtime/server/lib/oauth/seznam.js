import defu from "defu";
import { eventHandler, getQuery, sendRedirect } from "h3";
import { withQuery } from "ufo";
import { getOAuthRedirectURL, handleAccessTokenErrorResponse, handleMissingConfiguration, requestAccessToken } from "../utils.js";
import { useRuntimeConfig } from "#imports";
export function defineOAuthSeznamEventHandler({ config, onSuccess, onError }) {
  return eventHandler(async (event) => {
    config = defu(config, useRuntimeConfig(event).oauth?.seznam, {
      authorizationURL: "https://login.szn.cz/api/v1/oauth/auth",
      tokenURL: "https://login.szn.cz/api/v1/oauth/token",
      userURL: "https://login.szn.cz/api/v1/user"
    });
    const query = getQuery(event);
    if (!config.clientId || !config.clientSecret) {
      return handleMissingConfiguration(event, "seznam", ["clientId", "clientSecret"], onError);
    }
    const redirectURL = config.redirectURL || getOAuthRedirectURL(event);
    if (!query.code) {
      config.scope = config.scope || ["identity"];
      return sendRedirect(
        event,
        withQuery(config.authorizationURL, {
          response_type: "code",
          client_id: config.clientId,
          redirect_uri: redirectURL,
          scope: config.scope.join(","),
          state: query.state || ""
        })
      );
    }
    const tokens = await requestAccessToken(config.tokenURL, {
      body: {
        grant_type: "authorization_code",
        code: query.code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: redirectURL
      }
    });
    if (tokens.error) {
      return handleAccessTokenErrorResponse(event, "seznam", tokens, onError);
    }
    const accessToken = tokens.access_token;
    const user = await $fetch(
      config.userURL,
      {
        headers: {
          Authorization: `bearer ${accessToken}`
        }
      }
    );
    return onSuccess(event, {
      tokens,
      user
    });
  });
}
