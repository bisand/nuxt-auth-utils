import { eventHandler, getRequestHeader, readBody, sendRedirect } from "h3";
import { withQuery } from "ufo";
import { defu } from "defu";
import { handleMissingConfiguration, handleAccessTokenErrorResponse, getOAuthRedirectURL, requestAccessToken, signJwt, verifyJwt } from "../utils.js";
import { useRuntimeConfig } from "#imports";
export function defineOAuthAppleEventHandler({
  config,
  onSuccess,
  onError
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}) {
  return eventHandler(async (event) => {
    config = defu(config, useRuntimeConfig(event).oauth?.apple, {
      authorizationURL: config?.authorizationURL || "https://appleid.apple.com/auth/authorize",
      authorizationParams: {}
    });
    if (!config.teamId || !config.keyId || !config.privateKey || !config.clientId) {
      return handleMissingConfiguration(event, "apple", ["teamId", "keyId", "privateKey", "clientId"], onError);
    }
    const isPost = getRequestHeader(event, "content-type") === "application/x-www-form-urlencoded";
    let code;
    let user;
    if (isPost) {
      ({ code, user } = await readBody(event));
    }
    if (!isPost || !code) {
      const redirectURL = config.redirectURL || getOAuthRedirectURL(event);
      config.scope = Array.isArray(config.scope) ? config.scope.join(" ") : config.scope || "name email";
      return sendRedirect(
        event,
        withQuery(config.authorizationURL, {
          response_type: "code",
          response_mode: "form_post",
          client_id: config.clientId,
          redirect_uri: redirectURL,
          scope: config.scope,
          ...config.authorizationParams
        })
      );
    }
    try {
      const secret = await signJwt(
        {
          iss: config.teamId,
          aud: "https://appleid.apple.com",
          sub: config.clientId
        },
        {
          privateKey: config.privateKey,
          keyId: config.keyId,
          teamId: config.teamId,
          clientId: config.clientId,
          expiresIn: "5m"
        }
      );
      const accessTokenResult = await requestAccessToken(config.tokenURL || "https://appleid.apple.com/auth/token", {
        params: {
          client_id: config.clientId,
          client_secret: secret,
          code,
          grant_type: "authorization_code",
          redirect_uri: config.redirectURL
        }
      });
      const payload = await verifyJwt(accessTokenResult.id_token, {
        publicJwkUrl: "https://appleid.apple.com/auth/keys",
        audience: config.clientId,
        issuer: "https://appleid.apple.com"
      });
      if (!payload) {
        return handleAccessTokenErrorResponse(event, "apple", payload, onError);
      }
      return onSuccess(event, { user, payload, tokens: accessTokenResult });
    } catch (error) {
      return handleAccessTokenErrorResponse(event, "apple", error, onError);
    }
  });
}
