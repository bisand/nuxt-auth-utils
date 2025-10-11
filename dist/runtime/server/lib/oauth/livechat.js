import { eventHandler, getQuery, sendRedirect } from "h3";
import { defu } from "defu";
import { withQuery } from "ufo";
import { randomUUID } from "uncrypto";
import {
  getOAuthRedirectURL,
  handleAccessTokenErrorResponse,
  handleMissingConfiguration,
  requestAccessToken
} from "../utils.js";
import { useRuntimeConfig } from "#imports";
export function defineOAuthLiveChatEventHandler({
  config,
  onSuccess,
  onError
}) {
  return eventHandler(async (event) => {
    config = defu(config, useRuntimeConfig(event).oauth?.livechat, {
      authorizationURL: "https://accounts.livechat.com",
      tokenURL: "https://accounts.livechat.com/v2/token",
      userURL: "https://accounts.livechat.com/v2/accounts/me",
      authorizationParams: {
        state: randomUUID()
      }
    });
    if (!config.clientId || !config.clientSecret) {
      return handleMissingConfiguration(
        event,
        "livechat",
        ["clientId", "clientSecret"],
        onError
      );
    }
    const query = getQuery(event);
    const redirectURL = config.redirectURL || getOAuthRedirectURL(event);
    if (!query.code) {
      return sendRedirect(
        event,
        withQuery(config.authorizationURL, {
          client_id: config.clientId,
          redirect_uri: redirectURL,
          response_type: "code",
          scope: config.scope?.length ? config.scope.join(" ") : void 0,
          ...config.authorizationParams
        })
      );
    }
    const tokens = await requestAccessToken(config.tokenURL, {
      params: {
        grant_type: "authorization_code",
        code: query.code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: redirectURL
      }
    }).catch((error) => {
      return { error };
    });
    if (tokens.error) {
      return handleAccessTokenErrorResponse(event, "livechat", tokens, onError);
    }
    const user = await $fetch(config.userURL, {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`
      }
    });
    return onSuccess(event, {
      tokens,
      user
    });
  });
}
