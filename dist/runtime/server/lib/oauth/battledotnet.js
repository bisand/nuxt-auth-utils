import { eventHandler, getQuery, sendRedirect } from "h3";
import { withQuery } from "ufo";
import { defu } from "defu";
import { randomUUID } from "uncrypto";
import { handleMissingConfiguration, handleAccessTokenErrorResponse, getOAuthRedirectURL, requestAccessToken } from "../utils.js";
import { useRuntimeConfig, createError } from "#imports";
export function defineOAuthBattledotnetEventHandler({ config, onSuccess, onError }) {
  return eventHandler(async (event) => {
    config = defu(config, useRuntimeConfig(event).oauth?.battledotnet, {
      authorizationURL: "https://oauth.battle.net/authorize",
      tokenURL: "https://oauth.battle.net/token",
      authorizationParams: {}
    });
    const query = getQuery(event);
    if (query.error) {
      const error = createError({
        statusCode: 401,
        message: `Battle.net login failed: ${query.error || "Unknown error"}`,
        data: query
      });
      if (!onError) throw error;
      return onError(event, error);
    }
    if (!config.clientId || !config.clientSecret) {
      return handleMissingConfiguration(
        event,
        "battledotnet",
        ["clientId", "clientSecret"],
        onError
      );
    }
    const redirectURL = config.redirectURL || getOAuthRedirectURL(event);
    if (!query.code) {
      config.scope = config.scope || ["openid"];
      config.region = config.region || "EU";
      if (config.region === "CN") {
        config.authorizationURL = "https://oauth.battlenet.com.cn/authorize";
        config.tokenURL = "https://oauth.battlenet.com.cn/token";
      }
      return sendRedirect(
        event,
        withQuery(config.authorizationURL, {
          client_id: config.clientId,
          redirect_uri: redirectURL,
          scope: config.scope.join(" "),
          state: randomUUID(),
          // Todo: handle PKCE flow
          response_type: "code",
          ...config.authorizationParams
        })
      );
    }
    config.scope = config.scope || [];
    if (!config.scope.includes("openid")) {
      config.scope.push("openid");
    }
    const tokens = await requestAccessToken(config.tokenURL, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64")}`
      },
      params: {
        grant_type: "authorization_code",
        scope: config.scope.join(" "),
        redirect_uri: redirectURL,
        code: query.code
      }
    });
    if (tokens.error) {
      return handleAccessTokenErrorResponse(event, "battle.net", tokens, onError);
    }
    const accessToken = tokens.access_token;
    const user = await $fetch("https://oauth.battle.net/userinfo", {
      headers: {
        "User-Agent": `Battledotnet-OAuth-${config.clientId}`,
        "Authorization": `Bearer ${accessToken}`
      }
    });
    if (!user) {
      const error = createError({
        statusCode: 500,
        message: "Could not get Battle.net user",
        data: tokens
      });
      if (!onError) throw error;
      return onError(event, error);
    }
    return onSuccess(event, {
      user,
      tokens
    });
  });
}
