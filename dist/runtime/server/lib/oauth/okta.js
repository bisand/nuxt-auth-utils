import { eventHandler, getQuery, sendRedirect, createError, deleteCookie } from "h3";
import { withQuery } from "ufo";
import { defu } from "defu";
import { handleMissingConfiguration, handleState, handleInvalidState, handleAccessTokenErrorResponse, getOAuthRedirectURL, requestAccessToken } from "../utils.js";
import { useRuntimeConfig } from "#imports";
const openIdConfigCache = /* @__PURE__ */ new Map();
const DEFAULT_CACHE_TTL = 1e3 * 60 * 60 * 24;
export function defineOAuthOktaEventHandler({ config, onSuccess, onError }) {
  function normalizeScope(scope, emailRequired) {
    let result;
    if (!scope || typeof scope === "string" && scope.trim() === "") {
      result = ["openid", "email", "profile"];
    } else if (typeof scope === "string") {
      result = scope.split(/[,| ]+/).filter(Boolean);
    } else if (Array.isArray(scope) && scope.length > 0) {
      result = scope;
    } else {
      result = ["openid", "email", "profile"];
    }
    result = [...new Set(result)];
    if (emailRequired && !result.includes("email")) {
      result.push("email");
    }
    return result;
  }
  return eventHandler(async (event) => {
    const runtimeConfig = useRuntimeConfig(event);
    config = defu(config, runtimeConfig.oauth?.okta, {
      authorizationParams: {}
    });
    if (!config.clientId || !config.clientSecret || !config.domain || typeof config.domain !== "string" || !config.domain.trim()) {
      return handleMissingConfiguration(event, "okta", ["clientId", "clientSecret", "domain"], onError);
    }
    const query = getQuery(event);
    if (query.error) {
      const error = createError({
        statusCode: 401,
        message: `Okta login failed: ${query.error || "Unknown error"} - ${query.error_description || ""}`,
        data: query
      });
      if (!onError) throw error;
      return onError(event, error);
    }
    config.scope = normalizeScope(config.scope, config.emailRequired);
    const getOpenIdConfig = async (openIdConfigurationUrl2, event2) => {
      const now = Date.now();
      const cacheTTL = config?.openIdConfigCacheTTL || DEFAULT_CACHE_TTL;
      const cached = openIdConfigCache.get(openIdConfigurationUrl2);
      if (cached) {
        if (cached.expiresAt > now) {
          return cached.data;
        } else {
          openIdConfigCache.delete(openIdConfigurationUrl2);
        }
      }
      let openIdConfig2 = null;
      try {
        openIdConfig2 = await $fetch(openIdConfigurationUrl2);
        if (openIdConfig2) {
          openIdConfigCache.set(openIdConfigurationUrl2, {
            data: openIdConfig2,
            expiresAt: now + cacheTTL
          });
        }
      } catch (error) {
        if (config && config.domain) {
          const authz = config.authorizationServer;
          openIdConfig2 = {
            authorization_endpoint: authz ? `https://${config.domain}/oauth2/${authz}/v1/authorize` : `https://${config.domain}/oauth2/v1/authorize`,
            token_endpoint: authz ? `https://${config.domain}/oauth2/${authz}/v1/token` : `https://${config.domain}/oauth2/v1/token`,
            userinfo_endpoint: authz ? `https://${config.domain}/oauth2/${authz}/v1/userinfo` : `https://${config.domain}/oauth2/v1/userinfo`,
            end_session_endpoint: void 0
          };
          openIdConfigCache.set(openIdConfigurationUrl2, {
            data: openIdConfig2,
            expiresAt: now + Math.min(cacheTTL / 24, 1e3 * 60 * 60)
            // 1 hour or 1/24th of configured TTL, whichever is smaller
          });
        } else {
          console.error("Failed to fetch Okta OpenID configuration. Please check your Okta domain and network connectivity:", error);
          const err = createError({
            statusCode: 500,
            message: "Could not get Okta OpenID configuration. Please verify that your Okta domain is correct and reachable, and that the OpenID configuration endpoint is accessible.",
            data: error
          });
          if (onError) await onError(event2, err);
          throw err;
        }
      }
      return openIdConfig2;
    };
    const authServer = config.authorizationServer;
    const openIdConfigurationUrl = authServer ? `https://${config.domain}/oauth2/${authServer}/.well-known/openid-configuration` : `https://${config.domain}/.well-known/openid-configuration`;
    const openIdConfig = await getOpenIdConfig(openIdConfigurationUrl, event);
    const authorizationURL = openIdConfig.authorization_endpoint;
    const tokenURL = openIdConfig.token_endpoint;
    const userInfoUrl = openIdConfig.userinfo_endpoint;
    const redirectURL = config.redirectURL || getOAuthRedirectURL(event);
    const state = await handleState(event);
    if (!query.code) {
      return sendRedirect(
        event,
        withQuery(authorizationURL, {
          response_type: "code",
          client_id: config.clientId,
          redirect_uri: redirectURL,
          scope: config.scope.join(" "),
          audience: config.audience || "",
          max_age: config.maxAge || 0,
          connection: config.connection || "",
          state,
          ...config.authorizationParams
        })
      );
    }
    if (query.state !== state) {
      deleteCookie(event, "nuxt-auth-state");
      return handleInvalidState(event, "okta", onError);
    }
    const tokens = await requestAccessToken(tokenURL, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: {
        response_type: "code",
        grant_type: "authorization_code",
        client_id: config.clientId,
        client_secret: config.clientSecret,
        scope: config.scope?.join(" "),
        redirect_uri: redirectURL,
        code: query.code,
        state: query.state
      }
    });
    if (tokens.error) {
      return handleAccessTokenErrorResponse(event, "okta", tokens, onError);
    }
    if (!tokens.access_token || typeof tokens.access_token !== "string" || !tokens.token_type || typeof tokens.token_type !== "string") {
      const err = createError({
        statusCode: 400,
        message: "Invalid token response from Okta",
        data: tokens
      });
      if (onError) return onError(event, err);
      throw err;
    }
    const tokenType = tokens.token_type;
    const accessToken = tokens.access_token;
    let user;
    try {
      user = await $fetch(userInfoUrl, {
        headers: {
          Authorization: `${tokenType} ${accessToken}`
        }
      });
    } catch (error) {
      const err = createError({
        statusCode: 410,
        message: `Could not get Okta user info - ${error instanceof Error ? error.message : String(error)}`,
        data: tokens
      });
      if (onError) return onError(event, err);
      throw err;
    }
    return onSuccess(event, {
      tokens,
      user,
      openIdConfig
    });
  });
}
