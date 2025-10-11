import { eventHandler, getQuery, sendRedirect } from "h3";
import { withQuery } from "ufo";
import { defu } from "defu";
import { handleMissingConfiguration, handleAccessTokenErrorResponse, getOAuthRedirectURL, requestAccessToken, handleState, handlePkceVerifier, handleInvalidState } from "../utils.js";
import { useRuntimeConfig, createError } from "#imports";
export function defineOAuthZitadelEventHandler({ config, onSuccess, onError }) {
  return eventHandler(async (event) => {
    config = defu(config, useRuntimeConfig(event).oauth?.zitadel, {
      authorizationParams: {}
    });
    const query = getQuery(event);
    if (query.error) {
      const error = createError({
        statusCode: 401,
        message: `Zitadel login failed: ${query.error || "Unknown error"}`,
        data: query
      });
      if (!onError) throw error;
      return onError(event, error);
    }
    if (!config.clientId || !config.domain) {
      return handleMissingConfiguration(event, "zitadel", ["clientId", "domain"], onError);
    }
    const authorizationURL = `https://${config.domain}/oauth/v2/authorize`;
    const tokenURL = `https://${config.domain}/oauth/v2/token`;
    const redirectURL = config.redirectURL || getOAuthRedirectURL(event);
    const verifier = await handlePkceVerifier(event);
    const state = await handleState(event);
    if (!query.code) {
      config.scope = config.scope || ["openid"];
      return sendRedirect(
        event,
        withQuery(authorizationURL, {
          response_type: "code",
          client_id: config.clientId,
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
      return handleInvalidState(event, "zitadel", onError);
    }
    const request = {
      body: {
        grant_type: "authorization_code",
        client_id: config.clientId,
        redirect_uri: redirectURL,
        code: query.code,
        code_verifier: verifier.code_verifier
      }
    };
    if (config.clientSecret) {
      const basicAuthorization = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64");
      request.headers = {
        "Authorization": `Basic ${basicAuthorization}`,
        "Content-Type": "application/x-www-form-urlencoded"
      };
    }
    const tokens = await requestAccessToken(tokenURL, request);
    if (tokens.error) {
      return handleAccessTokenErrorResponse(event, "zitadel", tokens, onError);
    }
    const accessToken = tokens.access_token;
    const user = await $fetch(`https://${config.domain}/oidc/v1/userinfo`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json"
      }
    });
    if (!user) {
      const error = createError({
        statusCode: 500,
        message: "Could not get Zitadel user",
        data: tokens
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
