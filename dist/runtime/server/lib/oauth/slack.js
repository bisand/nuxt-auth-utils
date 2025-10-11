import { eventHandler, getQuery, sendRedirect } from "h3";
import { withQuery } from "ufo";
import { defu } from "defu";
import { handleMissingConfiguration, handleAccessTokenErrorResponse, getOAuthRedirectURL, requestAccessToken, handleState, handleInvalidState } from "../utils.js";
import { useRuntimeConfig, createError } from "#imports";
export function defineOAuthSlackEventHandler({
  config,
  onSuccess,
  onError
}) {
  return eventHandler(async (event) => {
    const runtimeConfig = useRuntimeConfig(event).oauth?.slack;
    const baseURL = "https://slack.com";
    config = defu(config, runtimeConfig, {
      authorizationURL: `${baseURL}/openid/connect/authorize`,
      tokenURL: `${baseURL}/api/openid.connect.token`,
      authorizationParams: {}
    });
    const query = getQuery(event);
    if (query.error) {
      const error = createError({
        statusCode: 401,
        message: `Slack login failed: ${query.error || "Unknown error"}`,
        data: query
      });
      if (!onError) throw error;
      return onError(event, error);
    }
    if (!config.clientId || !config.clientSecret) {
      return handleMissingConfiguration(event, "slack", ["clientId", "clientSecret"], onError);
    }
    const redirectURL = config.redirectURL || getOAuthRedirectURL(event);
    const state = await handleState(event);
    if (!query.code) {
      config.scope = config.scope || ["openid", "email", "profile"];
      return sendRedirect(
        event,
        withQuery(config.authorizationURL, {
          response_type: "code",
          client_id: config.clientId,
          redirect_uri: redirectURL,
          scope: config.scope.join(" "),
          state,
          ...config.authorizationParams
        })
      );
    }
    if (query.state !== state) {
      return handleInvalidState(event, "slack", onError);
    }
    const tokens = await requestAccessToken(config.tokenURL, {
      body: {
        grant_type: "authorization_code",
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: redirectURL,
        code: query.code
      }
    });
    if (tokens.error) {
      return handleAccessTokenErrorResponse(event, "slack", tokens, onError);
    }
    const accessToken = tokens.access_token;
    const user = await $fetch(`${baseURL}/api/openid.connect.userInfo`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return onSuccess(event, {
      user,
      tokens
    });
  });
}
