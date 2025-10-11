import { eventHandler, getQuery, sendRedirect } from "h3";
import { withQuery } from "ufo";
import { defu } from "defu";
import { handleMissingConfiguration, handleAccessTokenErrorResponse, getOAuthRedirectURL, requestAccessToken } from "../utils.js";
import { useRuntimeConfig, createError } from "#imports";
export function defineOAuthKeycloakEventHandler({
  config,
  onSuccess,
  onError
}) {
  return eventHandler(async (event) => {
    config = defu(config, useRuntimeConfig(event).oauth?.keycloak, {
      authorizationParams: {}
    });
    const query = getQuery(event);
    if (query.error) {
      const error = createError({
        statusCode: 401,
        message: `Keycloak login failed: ${query.error || "Unknown error"}`,
        data: query
      });
      if (!onError) throw error;
      return onError(event, error);
    }
    if (!config.clientId || !config.clientSecret || !config.serverUrl || !config.realm) {
      return handleMissingConfiguration(event, "keycloak", ["clientId", "clientSecret", "serverUrl", "realm"], onError);
    }
    const realmURL = `${config.serverUrl}/realms/${config.realm}`;
    const realmURLInternal = `${config.serverUrlInternal || config.serverUrl}/realms/${config.realm}`;
    const authorizationURL = `${realmURL}/protocol/openid-connect/auth`;
    const tokenURL = `${realmURLInternal}/protocol/openid-connect/token`;
    const redirectURL = config.redirectURL || getOAuthRedirectURL(event);
    if (!query.code) {
      config.scope = config.scope || ["openid"];
      return sendRedirect(
        event,
        withQuery(authorizationURL, {
          ...query,
          client_id: config.clientId,
          redirect_uri: redirectURL,
          scope: config.scope.join(" "),
          response_type: "code",
          ...config.authorizationParams
        })
      );
    }
    config.scope = config.scope || [];
    if (!config.scope.includes("openid")) {
      config.scope.push("openid");
    }
    const tokens = await requestAccessToken(tokenURL, {
      body: {
        grant_type: "authorization_code",
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: redirectURL,
        code: query.code
      }
    });
    if (tokens.error) {
      return handleAccessTokenErrorResponse(event, "keycloak", tokens, onError);
    }
    const accessToken = tokens.access_token;
    const user = await $fetch(
      `${realmURLInternal}/protocol/openid-connect/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json"
        }
      }
    );
    if (!user) {
      const error = createError({
        statusCode: 500,
        message: "Could not get Keycloak user",
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
