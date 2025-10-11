import { eventHandler, getQuery, sendRedirect } from "h3";
import { withQuery } from "ufo";
import { defu } from "defu";
import { randomUUID } from "uncrypto";
import { handleMissingConfiguration, handleAccessTokenErrorResponse, getOAuthRedirectURL, requestAccessToken } from "../utils.js";
import { useRuntimeConfig, createError } from "#imports";
export function defineOAuthAtlassianEventHandler({
  config,
  onSuccess,
  onError
}) {
  return eventHandler(async (event) => {
    config = defu(config, useRuntimeConfig().oauth?.atlassian, {
      authorizationURL: "https://auth.atlassian.com/authorize",
      tokenURL: "https://auth.atlassian.com/oauth/token",
      audienceURL: "https://api.atlassian.com",
      scope: ["read:me", "read:account"],
      authorizationParams: {}
    });
    if (!config.clientId || !config.clientSecret) {
      return handleMissingConfiguration(event, "atlassian", ["clientId", "clientSecret"], onError);
    }
    if (config.scope?.length === 0) {
      config.scope = ["read:me"];
    }
    if (config.emailHasToBeVerified && !config.scope?.includes("read:me")) {
      config.scope?.push("read:me");
    }
    const query = getQuery(event);
    const redirectURL = config.redirectURL || getOAuthRedirectURL(event);
    if (!query.code) {
      return sendRedirect(
        event,
        withQuery(config.authorizationURL, {
          audience: config.audienceURL,
          client_id: config.clientId,
          scope: config.scope?.join(" "),
          redirect_uri: redirectURL,
          state: randomUUID(),
          response_type: "code",
          prompt: "consent",
          ...config.authorizationParams
        })
      );
    }
    if (query.error) {
      const error = createError({
        statusCode: 401,
        message: `Atlassian login failed: ${query.error || "Unknown error"}`,
        data: query
      });
      if (!onError) throw error;
      return onError(event, error);
    }
    const tokens = await requestAccessToken(config.tokenURL, {
      headers: {
        "Content-Type": "application/json"
      },
      body: {
        grant_type: "authorization_code",
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code: query.code,
        redirect_uri: redirectURL
      }
    });
    if (tokens.error || !tokens.access_token) {
      return handleAccessTokenErrorResponse(event, "atlassian", tokens, onError);
    }
    const user = await $fetch("https://api.atlassian.com/me", {
      headers: {
        "Authorization": `Bearer ${tokens.access_token}`,
        "Content-Type": "application/json"
      }
    });
    if (user.account_status === "inactive") {
      const error = createError({
        statusCode: 403,
        statusMessage: "Atlassian account is inactive",
        data: { accountStatus: user.account_status }
      });
      if (!onError) throw error;
      return onError(event, error);
    }
    if (!user.email_verified) {
      const error = createError({
        statusCode: 400,
        statusMessage: "Email address is not verified",
        data: { email: user.email }
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
