import { eventHandler, getQuery, sendRedirect } from "h3";
import { withQuery } from "ufo";
import defu from "defu";
import {
  getOAuthRedirectURL,
  handleAccessTokenErrorResponse,
  handleMissingConfiguration,
  requestAccessToken
} from "../utils.js";
import { useRuntimeConfig } from "#imports";
export function defineOAuthHubspotEventHandler({ config, onSuccess, onError }) {
  return eventHandler(async (event) => {
    config = defu(config, useRuntimeConfig(event).oauth?.hubspot);
    if (!config.clientId || !config.clientSecret || !config.redirectURL) {
      return handleMissingConfiguration(event, "hubspot", ["clientId", "clientSecret", "redirectURL"], onError);
    }
    const query = getQuery(event);
    const redirectURL = config.redirectURL || getOAuthRedirectURL(event);
    if (query.error) {
      return handleAccessTokenErrorResponse(event, "hubspot", query, onError);
    }
    if (!query.code) {
      return sendRedirect(
        event,
        withQuery("https://app.hubspot.com/oauth/authorize", {
          client_id: config.clientId,
          redirect_uri: redirectURL,
          scope: config.scope?.join(" ") || "oauth"
        })
      );
    }
    const tokens = await requestAccessToken(
      "https://api.hubapi.com/oauth/v1/token",
      {
        body: {
          client_id: config.clientId,
          client_secret: config.clientSecret,
          code: query.code,
          redirect_uri: redirectURL,
          grant_type: "authorization_code"
        }
      }
    );
    if (tokens.error) {
      return handleAccessTokenErrorResponse(event, "hubspot", tokens, onError);
    }
    const info = await $fetch("https://api.hubapi.com/oauth/v1/access-tokens/" + tokens.access_token);
    return onSuccess(event, {
      user: {
        id: info.user_id,
        email: info.user,
        domain: info.hub_domain
      },
      tokens
    });
  });
}
