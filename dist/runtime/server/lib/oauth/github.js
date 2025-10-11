import { eventHandler, getQuery, sendRedirect, createError } from "h3";
import { withQuery } from "ufo";
import { defu } from "defu";
import { getOAuthRedirectURL, handleAccessTokenErrorResponse, handleInvalidState, handleMissingConfiguration, handleState, requestAccessToken } from "../utils.js";
import { useRuntimeConfig } from "#imports";
export function defineOAuthGitHubEventHandler({ config, onSuccess, onError }) {
  return eventHandler(async (event) => {
    config = defu(config, useRuntimeConfig(event).oauth?.github, {
      authorizationURL: "https://github.com/login/oauth/authorize",
      tokenURL: "https://github.com/login/oauth/access_token",
      apiURL: "https://api.github.com",
      authorizationParams: {}
    });
    const query = getQuery(event);
    if (query.error) {
      const error = createError({
        statusCode: 401,
        message: `GitHub login failed: ${query.error || "Unknown error"}`,
        data: query
      });
      if (!onError) throw error;
      return onError(event, error);
    }
    if (!config.clientId || !config.clientSecret) {
      return handleMissingConfiguration(event, "github", ["clientId", "clientSecret"], onError);
    }
    const redirectURL = config.redirectURL || getOAuthRedirectURL(event);
    const state = await handleState(event);
    if (!query.code) {
      config.scope = config.scope || [];
      if (config.emailRequired && !config.scope.includes("user:email")) {
        config.scope.push("user:email");
      }
      return sendRedirect(
        event,
        withQuery(config.authorizationURL, {
          client_id: config.clientId,
          redirect_uri: redirectURL,
          scope: config.scope.join(" "),
          state,
          ...config.authorizationParams
        })
      );
    }
    if (query.state !== state) {
      return handleInvalidState(event, "github", onError);
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
      return handleAccessTokenErrorResponse(event, "github", tokens, onError);
    }
    const accessToken = tokens.access_token;
    const user = await $fetch(`${config.apiURL}/user`, {
      headers: {
        "User-Agent": `Github-OAuth-${config.clientId}`,
        "Authorization": `token ${accessToken}`
      }
    });
    if (!user.email && config.emailRequired) {
      const emails = await $fetch(`${config.apiURL}/user/emails`, {
        headers: {
          "User-Agent": `Github-OAuth-${config.clientId}`,
          "Authorization": `token ${accessToken}`
        }
      });
      const primaryEmail = emails.find((email) => email.primary);
      if (!primaryEmail) {
        const error = createError({
          statusCode: 500,
          message: "Could not get GitHub user email",
          data: tokens
        });
        if (!onError) throw error;
        return onError(event, error);
      }
      user.email = primaryEmail.email;
      user.email_verified = primaryEmail.verified;
    }
    return onSuccess(event, {
      user,
      tokens
    });
  });
}
