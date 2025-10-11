import { eventHandler, getQuery, sendRedirect } from "h3";
import { withQuery } from "ufo";
import { defu } from "defu";
import {
  getOAuthRedirectURL,
  handleAccessTokenErrorResponse,
  handleInvalidState,
  handleMissingConfiguration,
  handlePkceVerifier,
  handleState,
  requestAccessToken
} from "../utils.js";
import { createError, useRuntimeConfig } from "#imports";
export function defineOAuthOryEventHandler({ config, onSuccess, onError }) {
  return eventHandler(async (event) => {
    config = defu(config, useRuntimeConfig(event).oauth?.ory, {
      scope: ["openid", "offline"],
      sdkURL: "https://playground.projects.oryapis.com",
      authorizationURL: "/oauth2/auth",
      tokenURL: "/oauth2/token",
      userURL: "/userinfo",
      authorizationParams: {}
    });
    const query = getQuery(event);
    if (query.error) {
      const error = createError({
        statusCode: 401,
        message: `Ory login failed: ${query.error || "Unknown error"}`,
        data: query
      });
      if (!onError) throw error;
      return onError(event, error);
    }
    if (!config.clientId || !config.sdkURL) {
      return handleMissingConfiguration(event, "ory", ["clientId", "sdkURL"], onError);
    }
    const redirectURL = getOAuthRedirectURL(event);
    if (Array.isArray(config.scope)) {
      config.scope = Array.from(new Set(config.scope)).join(" ");
    }
    const verifier = await handlePkceVerifier(event);
    const state = await handleState(event);
    if (!query.code) {
      const authorizationURL = `${config.sdkURL}${config.authorizationURL}`;
      return sendRedirect(
        event,
        withQuery(authorizationURL, {
          client_id: config.clientId,
          response_type: "code",
          redirect_uri: redirectURL,
          scope: config.scope,
          state,
          code_challenge: verifier.code_challenge,
          code_challenge_method: verifier.code_challenge_method,
          ...config.authorizationParams
        })
      );
    }
    if (query.state !== state) {
      handleInvalidState(event, "ory", onError);
    }
    const tokenURL = `${config.sdkURL}${config.tokenURL}`;
    const tokens = await requestAccessToken(tokenURL, {
      body: {
        grant_type: "authorization_code",
        client_id: config.clientId,
        code: query.code,
        redirect_uri: redirectURL,
        scope: config.scope,
        code_verifier: verifier.code_verifier
      }
    });
    if (tokens.error) {
      return handleAccessTokenErrorResponse(event, "ory", tokens, onError);
    }
    const tokenType = tokens.token_type;
    const accessToken = tokens.access_token;
    const userURL = `${config.sdkURL}${config.userURL}`;
    const user = await $fetch(userURL, {
      headers: {
        "User-Agent": `Ory-${config.clientId}`,
        "Authorization": `${tokenType} ${accessToken}`
      }
    }).catch((error) => {
      return { error };
    });
    if (user.error) {
      const error = createError({
        statusCode: 401,
        message: `Ory userinfo failed: ${user.error || "Unknown error"}`,
        data: user
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
