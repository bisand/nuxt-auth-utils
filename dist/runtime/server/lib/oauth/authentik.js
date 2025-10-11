import { eventHandler, getQuery, sendRedirect } from "h3";
import { withQuery } from "ufo";
import { defu } from "defu";
import { handleMissingConfiguration, handleAccessTokenErrorResponse, getOAuthRedirectURL, requestAccessToken } from "../utils.js";
import { useRuntimeConfig, createError } from "#imports";
export function defineOAuthAuthentikEventHandler({ config, onSuccess, onError }) {
  return eventHandler(async (event) => {
    config = defu(config, useRuntimeConfig(event).oauth?.authentik);
    const query = getQuery(event);
    if (query.error) {
      const error = createError({
        statusCode: 401,
        message: `Authentik login failed: ${query.error || "Unknown error"}`,
        data: query
      });
      if (!onError) throw error;
      return onError(event, error);
    }
    if (!config.clientId || !config.clientSecret || !config.domain) {
      return handleMissingConfiguration(event, "authentik", ["clientId", "clientSecret", "domain"], onError);
    }
    const authorizationURL = `https://${config.domain}/application/o/authorize/`;
    const tokenURL = `https://${config.domain}/application/o/token/`;
    const redirectURL = config.redirectURL || getOAuthRedirectURL(event);
    if (!query.code) {
      return sendRedirect(
        event,
        withQuery(authorizationURL, {
          response_type: "code",
          client_id: config.clientId,
          redirect_uri: redirectURL,
          scope: (config.scope || ["openid", "profile", "email"]).join(" ")
        })
      );
    }
    const tokens = await requestAccessToken(tokenURL, {
      headers: {
        "Authorization": `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: {
        grant_type: "authorization_code",
        client_id: config.clientId,
        redirect_uri: redirectURL,
        code: query.code
      }
    });
    if (tokens.error) {
      return handleAccessTokenErrorResponse(event, "authentik", tokens, onError);
    }
    const accessToken = tokens.access_token;
    const user = await $fetch(`https://${config.domain}/application/o/userinfo/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json"
      }
    });
    if (!user) {
      const error = createError({
        statusCode: 500,
        message: "Could not get Authentik user",
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
