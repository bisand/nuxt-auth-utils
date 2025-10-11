import { eventHandler, getQuery, sendRedirect } from "h3";
import { withQuery } from "ufo";
import { defu } from "defu";
import { randomUUID } from "uncrypto";
import {
  handleMissingConfiguration,
  handleAccessTokenErrorResponse,
  getOAuthRedirectURL,
  requestAccessToken
} from "../utils.js";
import { useRuntimeConfig } from "#imports";
export function defineOAuthXEventHandler({
  config,
  onSuccess,
  onError
}) {
  return eventHandler(async (event) => {
    config = defu(config, useRuntimeConfig(event).oauth?.x, {
      authorizationURL: "https://x.com/i/oauth2/authorize",
      tokenURL: "https://api.x.com/2/oauth2/token",
      userURL: "https://api.x.com/2/users/me",
      authorizationParams: {
        state: randomUUID(),
        code_challenge: randomUUID()
      }
    });
    const query = getQuery(event);
    if (!config.clientId || !config.clientSecret) {
      return handleMissingConfiguration(event, "x", ["clientId", "clientSecret"], onError);
    }
    const redirectURL = config.redirectURL || getOAuthRedirectURL(event);
    if (!query.code) {
      config.scope = config.scope || [
        "tweet.read",
        "users.read",
        "offline.access"
      ];
      return sendRedirect(
        event,
        withQuery(config.authorizationURL, {
          response_type: "code",
          client_id: config.clientId,
          code_challenge_method: "plain",
          redirect_uri: redirectURL,
          scope: config.scope.join(" "),
          ...config.authorizationParams
        })
      );
    }
    const tokens = await requestAccessToken(config.tokenURL, {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${config.clientId}:${config.clientSecret}`
        ).toString("base64")}`
      },
      params: {
        grant_type: "authorization_code",
        code_verifier: config.authorizationParams?.code_challenge,
        redirect_uri: redirectURL,
        code: query.code
      }
    });
    if (tokens.error) {
      return handleAccessTokenErrorResponse(event, "x", tokens, onError);
    }
    const accessToken = tokens.access_token;
    const user = await $fetch(config.userURL, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      query: {
        "user.fields": "description,id,name,profile_image_url,username,verified,verified_type"
      }
    }).catch((error) => {
      return error;
    });
    return onSuccess(event, {
      tokens,
      user: user?.data
    });
  });
}
