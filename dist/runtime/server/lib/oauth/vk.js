import crypto from "node:crypto";
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
export function defineOAuthVKEventHandler({
  config,
  onSuccess,
  onError
}) {
  return eventHandler(async (event) => {
    config = defu(config, useRuntimeConfig(event).oauth?.vk, {
      authorizationURL: "https://id.vk.com/authorize",
      tokenURL: "https://id.vk.com/oauth2/auth",
      userURL: "https://id.vk.com/oauth2/user_info"
    });
    const query = getQuery(event);
    if (!config.clientId || !config.clientSecret) {
      return handleMissingConfiguration(
        event,
        "vk",
        ["clientId", "clientSecret"],
        onError
      );
    }
    const codeVerifier = "verify";
    const redirectURL = config.redirectURL || getOAuthRedirectURL(event);
    if (!query.code) {
      config.scope = config.scope || [];
      if (config.emailRequired && !config.scope.includes("email")) {
        config.scope.push("email");
      }
      return sendRedirect(
        event,
        withQuery(config.authorizationURL, {
          response_type: "code",
          client_id: config.clientId,
          code_challenge: crypto.createHash("sha256").update(codeVerifier).digest("base64url"),
          code_challenge_method: "s256",
          state: crypto.randomUUID(),
          redirect_uri: redirectURL,
          scope: config.scope.join(" ")
        })
      );
    }
    const tokens = await requestAccessToken(config.tokenURL, {
      body: {
        grant_type: "authorization_code",
        code: query.code,
        code_verifier: codeVerifier,
        client_id: config.clientId,
        device_id: query.device_id,
        redirect_uri: redirectURL
      }
    });
    if (tokens.error) {
      return handleAccessTokenErrorResponse(event, "vk", tokens, onError);
    }
    const accessToken = tokens.access_token;
    const user = await $fetch(config.userURL, {
      method: "POST",
      body: {
        access_token: accessToken,
        client_id: config.clientId
      }
    });
    if (!user) {
      const error = createError({
        statusCode: 500,
        message: "Could not get VK user",
        data: tokens
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
