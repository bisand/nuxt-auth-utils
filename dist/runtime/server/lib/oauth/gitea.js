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
export function defineOAuthGiteaEventHandler({
  config,
  onSuccess,
  onError
}) {
  return eventHandler(async (event) => {
    const runtimeConfig = useRuntimeConfig(event).oauth?.gitea;
    const baseURL = config?.baseURL ?? runtimeConfig.baseURL ?? "https://gitea.com";
    config = defu(config, runtimeConfig, {
      authorizationURL: `${baseURL}/login/oauth/authorize`,
      tokenURL: `${baseURL}/login/oauth/access_token`,
      authorizationParams: {}
    });
    const query = getQuery(event);
    if (query.error) {
      const error = createError({
        statusCode: 401,
        message: `Gitea login failed: ${query.error || "Unknown error"}`,
        data: query
      });
      if (!onError) throw error;
      return onError(event, error);
    }
    if (!config.clientId || !config.clientSecret) {
      return handleMissingConfiguration(
        event,
        "gitea",
        ["clientId", "clientSecret"],
        onError
      );
    }
    const redirectURL = config.redirectURL || getOAuthRedirectURL(event);
    if (!query.code) {
      config.scope = config.scope || [];
      if (!config.scope.length) {
        config.scope.push("read:user");
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
      return handleAccessTokenErrorResponse(event, "gitea", tokens, onError);
    }
    const accessToken = tokens.access_token;
    const user = await $fetch(`${baseURL}/api/v1/user`, {
      headers: {
        Authorization: `token ${accessToken}`
      }
    });
    return onSuccess(event, {
      user,
      tokens
    });
  });
}
