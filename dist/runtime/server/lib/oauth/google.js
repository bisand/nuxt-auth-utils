import { eventHandler, getQuery, sendRedirect } from "h3";
import { withQuery } from "ufo";
import { defu } from "defu";
import { handleMissingConfiguration, handleAccessTokenErrorResponse, getOAuthRedirectURL, requestAccessToken } from "../utils.js";
import { useRuntimeConfig } from "#imports";
export function defineOAuthGoogleEventHandler({
  config,
  onSuccess,
  onError
}) {
  return eventHandler(async (event) => {
    config = defu(config, useRuntimeConfig(event).oauth?.google, {
      authorizationURL: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenURL: "https://oauth2.googleapis.com/token",
      userURL: "https://www.googleapis.com/oauth2/v3/userinfo",
      authorizationParams: {}
    });
    const query = getQuery(event);
    if (!config.clientId || !config.clientSecret) {
      return handleMissingConfiguration(event, "google", ["clientId", "clientSecret"], onError);
    }
    const redirectURL = config.redirectURL || getOAuthRedirectURL(event);
    if (!query.code) {
      config.scope = config.scope || ["email", "profile"];
      return sendRedirect(
        event,
        withQuery(config.authorizationURL, {
          response_type: "code",
          client_id: config.clientId,
          redirect_uri: redirectURL,
          scope: config.scope.join(" "),
          state: query.state || "",
          ...config.authorizationParams
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
      return handleAccessTokenErrorResponse(event, "google", tokens, onError);
    }
    const accessToken = tokens.access_token;
    const user = await $fetch(
      config.userURL,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );
    return onSuccess(event, {
      tokens,
      user
    });
  });
}
