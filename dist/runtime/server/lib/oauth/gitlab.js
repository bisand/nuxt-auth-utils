import { eventHandler, getQuery, sendRedirect } from "h3";
import { withQuery } from "ufo";
import { defu } from "defu";
import {
  handleMissingConfiguration,
  handleAccessTokenErrorResponse,
  getOAuthRedirectURL,
  requestAccessToken
} from "../utils.js";
import { useRuntimeConfig, createError } from "#imports";
export function defineOAuthGitLabEventHandler({
  config,
  onSuccess,
  onError
}) {
  return eventHandler(async (event) => {
    const runtimeConfig = useRuntimeConfig(event).oauth?.gitlab;
    const baseURL = config?.baseURL ?? runtimeConfig.baseURL ?? "https://gitlab.com";
    config = defu(config, runtimeConfig, {
      authorizationURL: `${baseURL}/oauth/authorize`,
      tokenURL: `${baseURL}/oauth/token`,
      authorizationParams: {}
    });
    const query = getQuery(event);
    if (query.error) {
      const error = createError({
        statusCode: 401,
        message: `GitLab login failed: ${query.error || "Unknown error"}`,
        data: query
      });
      if (!onError) throw error;
      return onError(event, error);
    }
    if (!config.clientId || !config.clientSecret) {
      return handleMissingConfiguration(
        event,
        "gitlab",
        ["clientId", "clientSecret"],
        onError
      );
    }
    const redirectURL = config.redirectURL || getOAuthRedirectURL(event);
    if (!query.code) {
      config.scope = config.scope || [];
      if (!config.scope.length) {
        config.scope.push("read_user");
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
      body: {
        grant_type: "authorization_code",
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: redirectURL,
        code: query.code
      }
    });
    if (tokens.error) {
      return handleAccessTokenErrorResponse(event, "gitlab", tokens, onError);
    }
    const accessToken = tokens.access_token;
    const user = await $fetch(`${baseURL}/api/v4/user`, {
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
