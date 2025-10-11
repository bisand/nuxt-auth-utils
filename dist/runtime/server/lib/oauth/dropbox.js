import { eventHandler, getQuery, sendRedirect } from "h3";
import { withQuery } from "ufo";
import { defu } from "defu";
import { handleMissingConfiguration, handleAccessTokenErrorResponse, getOAuthRedirectURL, requestAccessToken } from "../utils.js";
import { useRuntimeConfig, createError } from "#imports";
export function defineOAuthDropboxEventHandler({ config, onSuccess, onError }) {
  return eventHandler(async (event) => {
    config = defu(config, useRuntimeConfig(event).oauth?.dropbox, {
      authorizationURL: "https://www.dropbox.com/oauth2/authorize",
      tokenURL: "https://api.dropboxapi.com/oauth2/token",
      authorizationParams: {}
    });
    const query = getQuery(event);
    if (!config.clientId || !config.clientSecret) {
      return handleMissingConfiguration(event, "dropbox", ["clientId", "clientSecret"], onError);
    }
    const redirectURL = config.redirectURL || getOAuthRedirectURL(event);
    if (!query.code) {
      config.scope = config.scope || [];
      if (!config.scope.includes("openid")) {
        config.scope.push("openid");
      }
      if (config.emailRequired && !config.scope.includes("email")) {
        config.scope.push("email");
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
      params: {
        grant_type: "authorization_code",
        redirect_uri: redirectURL,
        code: query.code
      }
    });
    if (tokens.error) {
      return handleAccessTokenErrorResponse(event, "dropbox", tokens, onError);
    }
    const accessToken = tokens.access_token;
    const users = await $fetch("https://api.dropboxapi.com/2/openid/userinfo", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    const user = users;
    if (!user) {
      const error = createError({
        statusCode: 500,
        message: "Could not get Dropbox user",
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
