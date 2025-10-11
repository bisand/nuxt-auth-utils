import { eventHandler, getQuery, sendRedirect } from "h3";
import { withQuery } from "ufo";
import { defu } from "defu";
import { handleMissingConfiguration, handleAccessTokenErrorResponse, getOAuthRedirectURL, requestAccessToken, handleState, handleInvalidState } from "../utils.js";
import { useRuntimeConfig, createError } from "#imports";
export function defineOAuthHerokuEventHandler({
  config,
  onSuccess,
  onError
}) {
  return eventHandler(async (event) => {
    const runtimeConfig = useRuntimeConfig(event).oauth?.heroku;
    const baseURL = "https://id.heroku.com";
    config = defu(config, runtimeConfig, {
      authorizationURL: `${baseURL}/oauth/authorize`,
      tokenURL: `${baseURL}/oauth/token`,
      authorizationParams: {}
    });
    const query = getQuery(event);
    if (query.error) {
      const error = createError({
        statusCode: 401,
        message: `Heroku login failed: ${query.error || "Unknown error"}`,
        data: query
      });
      if (!onError) throw error;
      return onError(event, error);
    }
    if (!config.clientId || !config.clientSecret) {
      return handleMissingConfiguration(event, "heroku", ["clientId", "clientSecret"], onError);
    }
    const redirectURL = config.redirectURL || getOAuthRedirectURL(event);
    const state = await handleState(event);
    if (!query.code) {
      config.scope = config.scope || ["identity"];
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
      return handleInvalidState(event, "heroku", onError);
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
      return handleAccessTokenErrorResponse(event, "heroku", tokens, onError);
    }
    const accessToken = tokens.access_token;
    const user = await $fetch(`https://api.heroku.com/account`, {
      headers: {
        Accept: "application/vnd.heroku+json; version=3",
        Authorization: `Bearer ${accessToken}`
      }
    });
    return onSuccess(event, {
      user,
      tokens
    });
  });
}
