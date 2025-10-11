import { eventHandler, getQuery, sendRedirect, createError } from "h3";
import { withQuery } from "ufo";
import { defu } from "defu";
import { handleMissingConfiguration, handleAccessTokenErrorResponse, getOAuthRedirectURL, requestAccessToken } from "../utils.js";
import { useRuntimeConfig } from "#imports";
export function defineOAuthFacebookEventHandler({
  config,
  onSuccess,
  onError
}) {
  return eventHandler(async (event) => {
    config = defu(config, useRuntimeConfig(event).oauth?.facebook, {
      authorizationURL: "https://www.facebook.com/v19.0/dialog/oauth",
      tokenURL: "https://graph.facebook.com/v19.0/oauth/access_token",
      authorizationParams: {}
    });
    const query = getQuery(event);
    if (query.error) {
      const error = createError({
        statusCode: 401,
        message: `Facebook login failed: ${query.error || "Unknown error"}`,
        data: query
      });
      if (!onError) throw error;
      return onError(event, error);
    }
    if (!config.clientId || !config.clientSecret) {
      return handleMissingConfiguration(event, "facebook", ["clientId", "clientSecret"], onError);
    }
    const redirectURL = config.redirectURL || getOAuthRedirectURL(event);
    if (!query.code) {
      config.scope = [...new Set(config.scope)];
      return sendRedirect(
        event,
        withQuery(config.authorizationURL, {
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
        client_id: config.clientId,
        client_secret: config.clientSecret,
        grant_type: "authorization_code",
        redirect_uri: redirectURL,
        code: query.code
      }
    });
    if (tokens.error) {
      return handleAccessTokenErrorResponse(event, "facebook", tokens, onError);
    }
    const accessToken = tokens.access_token;
    config.fields = [...new Set(config.fields || ["id", "name"])];
    const fields = config.fields.join(",");
    const user = await $fetch(
      `https://graph.facebook.com/v19.0/me?fields=${fields}&access_token=${accessToken}`
    );
    if (!user) {
      const error = createError({
        statusCode: 500,
        message: "Could not get Facebook user",
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
