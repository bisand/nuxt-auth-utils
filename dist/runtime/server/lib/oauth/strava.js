import { eventHandler, getQuery, sendRedirect } from "h3";
import { withQuery } from "ufo";
import { defu } from "defu";
import {
  getOAuthRedirectURL,
  handleAccessTokenErrorResponse,
  handleMissingConfiguration,
  requestAccessToken
} from "../utils.js";
import { useRuntimeConfig, createError } from "#imports";
export function defineOAuthStravaEventHandler({
  config,
  onSuccess,
  onError
}) {
  return eventHandler(async (event) => {
    config = defu(config, useRuntimeConfig(event).oauth?.strava);
    const query = getQuery(event);
    if (query.error) {
      const error = createError({
        statusCode: 401,
        message: `Strava login failed: ${query.error || "Unknown error"}`,
        data: query
      });
      if (!onError) throw error;
      return onError(event, error);
    }
    if (!config.clientId || !config.clientSecret) {
      return handleMissingConfiguration(
        event,
        "strava",
        ["clientId", "clientSecret"],
        onError
      );
    }
    const authorizationURL = "https://www.strava.com/oauth/authorize";
    const tokenURL = "https://www.strava.com/oauth/token";
    const redirectURL = config.redirectURL || getOAuthRedirectURL(event);
    if (!query.code) {
      return sendRedirect(
        event,
        withQuery(authorizationURL, {
          client_id: config.clientId,
          redirect_uri: redirectURL,
          response_type: "code",
          approval_prompt: config.approvalPrompt || "auto",
          scope: config.scope
        })
      );
    }
    const tokens = await requestAccessToken(tokenURL, {
      body: {
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code: query.code,
        grant_type: "authorization_code",
        redirect_uri: redirectURL
      }
    });
    if (tokens.error) {
      return handleAccessTokenErrorResponse(event, "strava", tokens, onError);
    }
    const user = await $fetch("https://www.strava.com/api/v3/athlete", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`
      }
    });
    return onSuccess(event, {
      user,
      tokens
    });
  });
}
