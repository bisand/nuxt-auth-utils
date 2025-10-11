import { eventHandler, getQuery, sendRedirect } from "h3";
import { withQuery } from "ufo";
import { defu } from "defu";
import { handleMissingConfiguration, handleAccessTokenErrorResponse, getOAuthRedirectURL, requestAccessToken } from "../utils.js";
import { useRuntimeConfig, createError } from "#imports";
export function defineOAuthTwitchEventHandler({ config, onSuccess, onError }) {
  return eventHandler(async (event) => {
    config = defu(config, useRuntimeConfig(event).oauth?.twitch, {
      authorizationURL: "https://id.twitch.tv/oauth2/authorize",
      tokenURL: "https://id.twitch.tv/oauth2/token",
      authorizationParams: {}
    });
    const query = getQuery(event);
    if (!config.clientId || !config.clientSecret) {
      return handleMissingConfiguration(event, "twitch", ["clientId", "clientSecret"], onError);
    }
    const redirectURL = config.redirectURL || getOAuthRedirectURL(event);
    if (!query.code) {
      config.scope = config.scope || [];
      if (config.emailRequired && !config.scope.includes("user:read:email")) {
        config.scope.push("user:read:email");
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
      body: {
        grant_type: "authorization_code",
        redirect_uri: redirectURL,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code: query.code
      }
    });
    if (tokens.error) {
      return handleAccessTokenErrorResponse(event, "twitch", tokens, onError);
    }
    const accessToken = tokens.access_token;
    const users = await $fetch("https://api.twitch.tv/helix/users", {
      headers: {
        "Client-ID": config.clientId,
        "Authorization": `Bearer ${accessToken}`
      }
    });
    const user = users.data?.[0];
    if (!user) {
      const error = createError({
        statusCode: 500,
        message: "Could not get Twitch user",
        data: tokens
      });
      if (!onError) throw error;
      return onError(event, error);
    }
    return onSuccess(event, {
      tokens,
      user
    });
  });
}
