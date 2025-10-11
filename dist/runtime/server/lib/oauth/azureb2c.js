import { eventHandler, getQuery, sendRedirect } from "h3";
import { withQuery } from "ufo";
import { defu } from "defu";
import { handleMissingConfiguration, handleAccessTokenErrorResponse, getOAuthRedirectURL, requestAccessToken, handlePkceVerifier, handleState, handleInvalidState } from "../utils.js";
import { useRuntimeConfig, createError } from "#imports";
export function defineOAuthAzureB2CEventHandler({ config, onSuccess, onError }) {
  return eventHandler(async (event) => {
    config = defu(config, useRuntimeConfig(event).oauth?.azureb2c, {
      authorizationParams: {}
    });
    const query = getQuery(event);
    if (!config.clientId || !config.policy || !config.tenant) {
      return handleMissingConfiguration(event, "azureb2c", ["clientId", "policy", "tenant"], onError);
    }
    const authorizationURL = config.authorizationURL || `https://${config.tenant}.b2clogin.com/${config.tenant}.onmicrosoft.com/${config.policy}/oauth2/v2.0/authorize`;
    const tokenURL = config.tokenURL || `https://${config.tenant}.b2clogin.com/${config.tenant}.onmicrosoft.com/${config.policy}/oauth2/v2.0/token`;
    const redirectURL = config.redirectURL || getOAuthRedirectURL(event);
    config.scope = config.scope && config.scope.length > 0 ? config.scope : ["openid"];
    config.scope = [...new Set(config.scope)];
    const verifier = await handlePkceVerifier(event);
    const state = await handleState(event);
    if (!query.code) {
      return sendRedirect(
        event,
        withQuery(authorizationURL, {
          client_id: config.clientId,
          response_type: "code",
          redirect_uri: redirectURL,
          scope: config.scope.join(" "),
          state,
          code_challenge: verifier.code_challenge,
          code_challenge_method: verifier.code_challenge_method,
          ...config.authorizationParams
        })
      );
    }
    if (query.state !== state) {
      return handleInvalidState(event, "azureb2c", onError);
    }
    console.info("code verifier", verifier.code_verifier);
    const tokens = await requestAccessToken(tokenURL, {
      body: {
        grant_type: "authorization_code",
        client_id: config.clientId,
        scope: config.scope.join(" "),
        code: query.code,
        redirect_uri: redirectURL,
        response_type: "code",
        code_verifier: verifier.code_verifier
      }
    });
    if (tokens.error) {
      return handleAccessTokenErrorResponse(event, "azureb2c", tokens, onError);
    }
    const tokenType = tokens.token_type;
    const accessToken = tokens.access_token;
    const userURL = config.userURL || "https://graph.microsoft.com/v1.0/me";
    const user = await $fetch(userURL, {
      headers: {
        Authorization: `${tokenType} ${accessToken}`
      }
    }).catch((error) => {
      return { error };
    });
    if (user.error) {
      const error = createError({
        statusCode: 401,
        message: `azureb2c login failed: ${user.error || "Unknown error"}`,
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
