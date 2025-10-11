import { eventHandler, getQuery, sendRedirect } from "h3";
import { withQuery } from "ufo";
import { defu } from "defu";
import { randomUUID } from "uncrypto";
import { handleAccessTokenErrorResponse, handleMissingConfiguration, getOAuthRedirectURL, requestAccessToken, handlePkceVerifier } from "../utils.js";
import { useRuntimeConfig, createError } from "#imports";
export function defineOAuthKickEventHandler({ config, onSuccess, onError }) {
  return eventHandler(async (event) => {
    config = defu(config, useRuntimeConfig(event).oauth?.kick, {
      authorizationURL: "https://id.kick.com/oauth/authorize",
      tokenURL: "https://id.kick.com/oauth/token"
    });
    const query = getQuery(event);
    if (!config.clientId || !config.clientSecret) {
      return handleMissingConfiguration(event, "kick", ["clientId", "clientSecret"], onError);
    }
    const verifier = await handlePkceVerifier(event);
    const redirectURL = config.redirectURL || getOAuthRedirectURL(event);
    if (!query.code) {
      config.scope = config.scope || [];
      if (!config.scope.includes("user:read"))
        config.scope.push("user:read");
      return sendRedirect(
        event,
        withQuery(config.authorizationURL, {
          response_type: "code",
          client_id: config.clientId,
          redirect_uri: redirectURL,
          scope: config.scope.join(" "),
          state: randomUUID(),
          code_challenge: verifier.code_challenge,
          code_challenge_method: verifier.code_challenge_method
        })
      );
    }
    const tokens = await requestAccessToken(config.tokenURL, {
      body: {
        grant_type: "authorization_code",
        redirect_uri: redirectURL,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code: query.code,
        code_verifier: verifier.code_verifier
      }
    });
    if (tokens.error) {
      return handleAccessTokenErrorResponse(event, "kick", tokens, onError);
    }
    const accessToken = tokens.access_token;
    const { data } = await $fetch("https://api.kick.com/public/v1/users", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json"
      }
    });
    if (!data || !data.length) {
      const error = createError({
        statusCode: 500,
        message: "Could not get Kick user",
        data: tokens
      });
      if (!onError) throw error;
      return onError(event, error);
    }
    const user = data[0];
    return onSuccess(event, {
      tokens,
      user
    });
  });
}
