import crypto from "node:crypto";
import { eventHandler, getQuery, sendRedirect } from "h3";
import { withQuery } from "ufo";
import { defu } from "defu";
import { handleAccessTokenErrorResponse, handleMissingConfiguration, getOAuthRedirectURL, requestAccessToken } from "../utils.js";
import { useRuntimeConfig, createError } from "#imports";
export function defineOAuthTikTokEventHandler({ config, onSuccess, onError }) {
  return eventHandler(async (event) => {
    config = defu(config, useRuntimeConfig(event).oauth?.tiktok, {
      sandbox: import.meta.dev,
      authorizationURL: "https://www.tiktok.com/v2/auth/authorize/",
      tokenURL: "https://open.tiktokapis.com/v2/oauth/token/"
    });
    const query = getQuery(event);
    if (!config.clientKey || !config.clientSecret) {
      return handleMissingConfiguration(event, "tiktok", ["clientKey", "clientSecret"], onError);
    }
    const codeVerifier = "verify";
    const redirectURL = config.redirectURL || getOAuthRedirectURL(event);
    if (!query.code) {
      config.scope = config.scope || [];
      if (!config.scope.includes("user.info.basic")) {
        config.scope.push("user.info.basic");
      }
      return sendRedirect(
        event,
        withQuery(config.authorizationURL, {
          response_type: "code",
          client_key: config.clientKey,
          redirect_uri: redirectURL,
          scope: config.scope.join(","),
          ...config.sandbox ? {
            code_verifier: codeVerifier,
            code_challenge: crypto.createHash("sha256").update(codeVerifier).digest("hex"),
            code_challenge_method: "S256"
          } : {}
        })
      );
    }
    const tokens = await requestAccessToken(
      config.tokenURL,
      {
        body: {
          grant_type: "authorization_code",
          redirect_uri: redirectURL,
          client_key: config.clientKey,
          client_secret: config.clientSecret,
          code: query.code,
          ...config.sandbox ? { code_verifier: codeVerifier } : {}
        }
      }
    );
    if (tokens.error) {
      return handleAccessTokenErrorResponse(event, "tiktok", tokens, onError);
    }
    const accessToken = tokens.access_token;
    const userInfoFieldsByScope = {
      "user.info.basic": ["open_id", "union_id", "avatar_url", "avatar_url_100", "avatar_large_url", "display_name"],
      "user.info.profile": ["bio_description", "profile_deep_link", "is_verified", "username"],
      "user.info.stats": ["follower_count", "following_count", "likes_count", "video_count"]
    };
    const userInfo = await $fetch(withQuery("https://open.tiktokapis.com/v2/user/info/", {
      fields: config.scope?.map((scope) => userInfoFieldsByScope[scope]).flat().join(",")
    }), {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    const user = userInfo?.data?.user;
    if (!user) {
      const error = createError({
        statusCode: 500,
        message: "Could not get TikTok user",
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
