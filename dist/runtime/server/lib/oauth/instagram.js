import { eventHandler, getQuery, sendRedirect, createError } from "h3";
import { withQuery } from "ufo";
import { defu } from "defu";
import { handleMissingConfiguration, handleAccessTokenErrorResponse, getOAuthRedirectURL, requestAccessToken } from "../utils.js";
import { useRuntimeConfig } from "#imports";
export function defineOAuthInstagramEventHandler({
  config,
  onSuccess,
  onError
}) {
  return eventHandler(async (event) => {
    config = defu(config, useRuntimeConfig(event).oauth?.instagram, {
      scope: ["business_basic"],
      authorizationURL: "https://www.instagram.com/oauth/authorize",
      tokenURL: "https://api.instagram.com/oauth/access_token",
      authorizationParams: {}
    });
    const query = getQuery(event);
    if (query.error) {
      const error = createError({
        statusCode: 401,
        message: `Instagram login failed: ${query.error || "Unknown error"}`,
        data: {
          error: query.error,
          error_reason: query.error_reason,
          error_description: query.error_description
        }
      });
      if (!onError) throw error;
      return onError(event, error);
    }
    if (!config.clientId || !config.clientSecret) {
      return handleMissingConfiguration(event, "instagram", ["clientId", "clientSecret"], onError);
    }
    const redirectURL = config.redirectURL || getOAuthRedirectURL(event);
    if (!query.code) {
      config.scope = config.scope || [];
      return sendRedirect(
        event,
        withQuery(config.authorizationURL, {
          client_id: config.clientId,
          redirect_uri: redirectURL,
          scope: config.scope.join(),
          response_type: "code"
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
      return handleAccessTokenErrorResponse(event, "instagram", tokens, onError);
    }
    const accessToken = tokens.access_token;
    config.fields = config.fields || ["id", "username"];
    const fields = config.fields.join();
    const user = await $fetch(
      `https://graph.instagram.com/v21.0/me?fields=${fields}&access_token=${accessToken}`
    );
    if (!user) {
      const error = createError({
        statusCode: 500,
        message: "Could not get Instagram user",
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
