import { eventHandler, getQuery, sendRedirect } from "h3";
import { withQuery } from "ufo";
import { defu } from "defu";
import { handleMissingConfiguration, handleAccessTokenErrorResponse, getOAuthRedirectURL, requestAccessToken, handleState, handleInvalidState } from "../utils.js";
import { useRuntimeConfig, createError } from "#imports";
export function defineOAuthSalesforceEventHandler({
  config,
  onSuccess,
  onError
}) {
  return eventHandler(async (event) => {
    const runtimeConfig = useRuntimeConfig(event).oauth?.salesforce;
    const baseURL = config?.baseURL || "https://login.salesforce.com";
    config = defu(config, runtimeConfig, {
      authorizationURL: `${baseURL}/services/oauth2/authorize`,
      tokenURL: `${baseURL}/services/oauth2/token`,
      authorizationParams: {}
    });
    const query = getQuery(event);
    if (query.error) {
      const error = createError({
        statusCode: 401,
        message: `Salesforce login failed: ${query.error || "Unknown error"}`,
        data: query
      });
      if (!onError) throw error;
      return onError(event, error);
    }
    if (!config.clientId || !config.clientSecret) {
      return handleMissingConfiguration(event, "salesforce", ["clientId", "clientSecret"], onError);
    }
    const redirectURL = config.redirectURL || getOAuthRedirectURL(event);
    const state = await handleState(event);
    if (!query.code) {
      config.scope = config.scope || ["id"];
      return sendRedirect(
        event,
        withQuery(config.authorizationURL, {
          response_type: "code",
          client_id: config.clientId,
          redirect_uri: redirectURL,
          scope: config.scope.join(" "),
          state,
          ...config.authorizationParams
        })
      );
    }
    if (query.state !== state) {
      return handleInvalidState(event, "salesforce", onError);
    }
    const tokens = await requestAccessToken(config.tokenURL, {
      body: {
        grant_type: "authorization_code",
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: redirectURL,
        code: query.code
      }
    });
    if (tokens.error) {
      return handleAccessTokenErrorResponse(event, "salesforce", tokens, onError);
    }
    const accessToken = tokens.access_token;
    const user = await $fetch(`${baseURL}/services/oauth2/userinfo`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return onSuccess(event, {
      user,
      tokens
    });
  });
}
