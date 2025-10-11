import { eventHandler, getQuery, sendRedirect } from "h3";
import { withQuery } from "ufo";
import { defu } from "defu";
import { handleMissingConfiguration, handleAccessTokenErrorResponse, getOAuthRedirectURL, requestAccessToken } from "../utils.js";
import { useRuntimeConfig } from "#imports";
export function defineOAuthSpotifyEventHandler({ config, onSuccess, onError }) {
  return eventHandler(async (event) => {
    config = defu(config, useRuntimeConfig(event).oauth?.spotify, {
      authorizationURL: "https://accounts.spotify.com/authorize",
      tokenURL: "https://accounts.spotify.com/api/token",
      authorizationParams: {}
    });
    const query = getQuery(event);
    if (!config.clientId || !config.clientSecret) {
      return handleMissingConfiguration(event, "spotify", ["clientId", "clientSecret"], onError);
    }
    const redirectURL = config.redirectURL || getOAuthRedirectURL(event);
    if (!query.code) {
      config.scope = config.scope || [];
      if (config.emailRequired && !config.scope.includes("user-read-email")) {
        config.scope.push("user-read-email");
      }
      return sendRedirect(
        event,
        withQuery(config.authorizationURL, {
          response_type: "code",
          client_id: config.clientId,
          redirect_uri: redirectURL,
          scope: config.scope.join(" "),
          ...config.authorizationParams
        })
      );
    }
    const tokens = await requestAccessToken(config.tokenURL, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64")}`
      },
      body: {
        client_id: config.clientId,
        grant_type: "authorization_code",
        redirect_uri: redirectURL,
        code: query.code
      }
    });
    if (tokens.error) {
      return handleAccessTokenErrorResponse(event, "spotify", tokens, onError);
    }
    const accessToken = tokens.access_token;
    const user = await $fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return onSuccess(event, {
      tokens,
      user
    });
  });
}
