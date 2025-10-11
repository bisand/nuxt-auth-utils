import { eventHandler, getQuery, sendRedirect } from "h3";
import { withQuery } from "ufo";
import { defu } from "defu";
import { handleMissingConfiguration, handleAccessTokenErrorResponse, getOAuthRedirectURL, requestAccessToken } from "../utils.js";
import { useRuntimeConfig, createError } from "#imports";
export function defineOAuthMicrosoftEventHandler({ config, onSuccess, onError }) {
  return eventHandler(async (event) => {
    config = defu(config, useRuntimeConfig(event).oauth?.microsoft, {
      authorizationParams: {}
    });
    const query = getQuery(event);
    if (!config.clientId || !config.clientSecret || !config.tenant) {
      return handleMissingConfiguration(event, "microsoft", ["clientId", "clientSecret", "tenant"], onError);
    }
    const authorizationURL = config.authorizationURL || `https://login.microsoftonline.com/${config.tenant}/oauth2/v2.0/authorize`;
    const tokenURL = config.tokenURL || `https://login.microsoftonline.com/${config.tenant}/oauth2/v2.0/token`;
    const redirectURL = config.redirectURL || getOAuthRedirectURL(event);
    if (!query.code) {
      config.scope = config.scope && config.scope.length > 0 ? config.scope : ["User.Read"];
      config.scope = [...new Set(config.scope)];
      return sendRedirect(
        event,
        withQuery(authorizationURL, {
          client_id: config.clientId,
          response_type: "code",
          redirect_uri: redirectURL,
          scope: config.scope.join(" "),
          state: query.state || "",
          ...config.authorizationParams
        })
      );
    }
    const tokens = await requestAccessToken(tokenURL, {
      body: {
        grant_type: "authorization_code",
        code: query.code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: redirectURL
      }
    });
    if (tokens.error) {
      return handleAccessTokenErrorResponse(event, "microsoft", tokens, onError);
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
        message: `Microsoft login failed: ${user.error || "Unknown error"}`,
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
