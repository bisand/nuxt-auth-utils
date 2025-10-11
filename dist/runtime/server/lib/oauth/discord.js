import { eventHandler, getQuery, sendRedirect } from "h3";
import { withQuery } from "ufo";
import { defu } from "defu";
import { handleMissingConfiguration, handleAccessTokenErrorResponse, getOAuthRedirectURL, requestAccessToken } from "../utils.js";
import { useRuntimeConfig } from "#imports";
export function defineOAuthDiscordEventHandler({ config, onSuccess, onError }) {
  return eventHandler(async (event) => {
    config = defu(config, useRuntimeConfig(event).oauth?.discord, {
      authorizationURL: "https://discord.com/oauth2/authorize",
      tokenURL: "https://discord.com/api/oauth2/token",
      profileRequired: true,
      authorizationParams: {}
    });
    const query = getQuery(event);
    if (!config.clientId || !config.clientSecret) {
      return handleMissingConfiguration(event, "discord", ["clientId", "clientSecret"], onError);
    }
    if (query.error) {
      return handleAccessTokenErrorResponse(event, "discord", query, onError);
    }
    const redirectURL = config.redirectURL || getOAuthRedirectURL(event);
    if (!query.code) {
      config.scope = config.scope || [];
      if (config.emailRequired && !config.scope.includes("email")) {
        config.scope.push("email");
      }
      if (config.profileRequired && !config.scope.includes("identify")) {
        config.scope.push("identify");
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
        client_id: config.clientId,
        client_secret: config.clientSecret,
        grant_type: "authorization_code",
        redirect_uri: redirectURL,
        code: query.code
      }
    });
    if (tokens.error) {
      return handleAccessTokenErrorResponse(event, "discord", tokens, onError);
    }
    const accessToken = tokens.access_token;
    const user = await $fetch("https://discord.com/api/users/@me", {
      headers: {
        "user-agent": "Nuxt Auth Utils",
        "Authorization": `Bearer ${accessToken}`
      }
    });
    return onSuccess(event, {
      tokens,
      user
    });
  });
}
