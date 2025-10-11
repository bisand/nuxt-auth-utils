import { eventHandler, getQuery, sendRedirect } from "h3";
import { withQuery } from "ufo";
import { defu } from "defu";
import { handleMissingConfiguration, handleAccessTokenErrorResponse, getOAuthRedirectURL, requestAccessToken } from "../utils.js";
import { useRuntimeConfig, createError } from "#imports";
export function defineOAuthPaypalEventHandler({ config, onSuccess, onError }) {
  return eventHandler(async (event) => {
    config = defu(config, useRuntimeConfig(event).oauth?.paypal, {
      sandbox: import.meta.dev,
      authorizationURL: "https://www.paypal.com/signin/authorize",
      tokenURL: "https://api-m.paypal.com/v1/oauth2/token",
      authorizationParams: {}
    });
    const query = getQuery(event);
    if (!config.clientId || !config.clientSecret) {
      return handleMissingConfiguration(event, "paypal", ["clientId", "clientSecret"], onError);
    }
    let paypalAPI = "api-m.paypal.com";
    if (config.sandbox) {
      paypalAPI = "api-m.sandbox.paypal.com";
      config.authorizationURL = "https://www.sandbox.paypal.com/signin/authorize";
      config.tokenURL = `https://${paypalAPI}/v1/oauth2/token`;
    }
    const redirectURL = config.redirectURL || getOAuthRedirectURL(event);
    if (!query.code) {
      config.scope = config.scope || [];
      if (!config.scope.includes("openid")) {
        config.scope.push("openid");
      }
      if (config.emailRequired && !config.scope.includes("email")) {
        config.scope.push("email");
      }
      return sendRedirect(
        event,
        withQuery(config.authorizationURL, {
          response_type: "code",
          client_id: config.clientId,
          redirect_uri: redirectURL,
          scope: config.scope.join(" "),
          flowEntry: "static",
          ...config.authorizationParams
        })
      );
    }
    const tokens = await requestAccessToken(config.tokenURL, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64")}`
      },
      params: {
        grant_type: "authorization_code",
        redirect_uri: encodeURIComponent(redirectURL),
        // <- PayPal requires to be URL encoded
        code: query.code
      }
    });
    if (tokens.error) {
      return handleAccessTokenErrorResponse(event, "paypal", tokens, onError);
    }
    const accessToken = tokens.access_token;
    const users = await $fetch(`https://${paypalAPI}/v1/identity/openidconnect/userinfo`, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      params: {
        schema: "openid"
      }
    });
    const user = users;
    if (!user) {
      const error = createError({
        statusCode: 500,
        message: "Could not get PayPal user",
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
