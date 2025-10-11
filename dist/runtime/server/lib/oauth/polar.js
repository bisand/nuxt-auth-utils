import { eventHandler, getQuery, sendRedirect } from "h3";
import { withQuery } from "ufo";
import { defu } from "defu";
import { handleAccessTokenErrorResponse, handleMissingConfiguration, getOAuthRedirectURL, requestAccessToken } from "../utils.js";
import { useRuntimeConfig, createError } from "#imports";
export function defineOAuthPolarEventHandler({ config, onSuccess, onError }) {
  return eventHandler(async (event) => {
    config = defu(config, useRuntimeConfig(event).oauth?.polar, {
      authorizationURL: "https://polar.sh/oauth2/authorize",
      tokenURL: "https://api.polar.sh/v1/oauth2/token"
    });
    const query = getQuery(event);
    if (!config.clientId || !config.clientSecret) {
      return handleMissingConfiguration(event, "polar", ["clientId", "clientSecret"], onError);
    }
    const redirectURL = config.redirectURL || getOAuthRedirectURL(event);
    if (!query.code) {
      config.scope = config.scope || [];
      if (!config.scope.includes("openid"))
        config.scope.push("openid");
      if (config.emailRequired && !config.scope.includes("email"))
        config.scope.push("email");
      return sendRedirect(
        event,
        withQuery(config.authorizationURL, {
          response_type: "code",
          client_id: config.clientId,
          redirect_uri: redirectURL,
          scope: config.scope.join(" "),
          ...config.authorizationParams
        })
      );
    }
    const tokens = await requestAccessToken(config.tokenURL, {
      body: {
        grant_type: "authorization_code",
        redirect_uri: redirectURL,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code: query.code
      }
    });
    if (tokens.error) {
      return handleAccessTokenErrorResponse(event, "polar", tokens, onError);
    }
    const accessToken = tokens.access_token;
    const user = await $fetch("https://api.polar.sh/v1/oauth2/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json"
      }
    });
    if (!user) {
      const error = createError({
        statusCode: 500,
        message: "Could not get Polar user",
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
