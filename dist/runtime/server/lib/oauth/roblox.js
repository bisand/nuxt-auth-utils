import { eventHandler, getQuery, sendRedirect } from "h3";
import { withQuery } from "ufo";
import { defu } from "defu";
import { handleMissingConfiguration, handleAccessTokenErrorResponse, getOAuthRedirectURL, requestAccessToken } from "../utils.js";
import { useRuntimeConfig } from "#imports";
export function defineOAuthRobloxEventHandler({ config, onSuccess, onError }) {
  return eventHandler(async (event) => {
    config = defu(config, useRuntimeConfig(event).oauth?.roblox, {
      authorizationURL: "https://apis.roblox.com/oauth/v1/authorize",
      tokenURL: "https://apis.roblox.com/oauth/v1/token",
      authorizationParams: {}
    });
    const query = getQuery(event);
    if (!config.clientId || !config.clientSecret) {
      return handleMissingConfiguration(event, "roblox", ["clientId", "clientSecret"], onError);
    }
    if (query.error) {
      return handleAccessTokenErrorResponse(event, "roblox", query, onError);
    }
    const redirectURL = config.redirectURL || getOAuthRedirectURL(event);
    if (!query.code) {
      config.scope = config.scope || [];
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
      return handleAccessTokenErrorResponse(event, "roblox", tokens, onError);
    }
    const accessToken = tokens.access_token;
    const userInfo = await $fetch("https://apis.roblox.com/oauth/userinfo", {
      headers: {
        "user-agent": "Nuxt Auth Utils",
        "Authorization": `Bearer ${accessToken}`
      }
    });
    const user = await $fetch(`https://apis.roblox.com/cloud/v2/users/${userInfo.sub}`, {
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
