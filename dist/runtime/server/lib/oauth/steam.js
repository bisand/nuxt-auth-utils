import { eventHandler, createError, getQuery, getRequestURL, sendRedirect } from "h3";
import { withQuery } from "ufo";
import { defu } from "defu";
import { handleMissingConfiguration } from "../utils.js";
import { useRuntimeConfig } from "#imports";
export function defineOAuthSteamEventHandler({ config, onSuccess, onError }) {
  return eventHandler(async (event) => {
    config = defu(config, useRuntimeConfig(event).oauth?.steam, {
      authorizationURL: "https://steamcommunity.com/openid/login"
    });
    const query = getQuery(event);
    if (!config.apiKey) {
      return handleMissingConfiguration(event, "steam", ["apiKey"], onError);
    }
    const url = getRequestURL(event);
    if (!query["openid.claimed_id"]) {
      const redirectURL = config.redirectURL || getRequestURL(event).href;
      const steamOpenIdParams = {
        "openid.ns": "http://specs.openid.net/auth/2.0",
        "openid.mode": "checkid_setup",
        "openid.return_to": redirectURL,
        "openid.realm": `${url.protocol}//${url.hostname}`,
        "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
        "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select"
      };
      return sendRedirect(event, withQuery(config.authorizationURL, steamOpenIdParams));
    }
    if (!query["openid.signed"] || !query["openid.sig"]) {
      const error = createError({
        statusCode: 400,
        message: "Steam login failed: Incomplete query."
      });
      if (!onError) throw error;
      return onError(event, error);
    }
    const openIdCheck = {
      "openid.ns": "http://specs.openid.net/auth/2.0",
      "openid.mode": "check_authentication",
      "openid.signed": query["openid.signed"],
      "openid.sig": query["openid.sig"]
    };
    for (const signed of query["openid.signed"].split(",")) {
      if (!query[`openid.${signed}`]) {
        const error = createError({
          statusCode: 400,
          message: "Steam login failed: Incomplete query."
        });
        if (!onError) throw error;
        return onError(event, error);
      }
      openIdCheck[`openid.${signed}`] = query[`openid.${signed}`];
    }
    const auth_validation = await $fetch(withQuery(config?.authorizationURL, openIdCheck));
    const validRegex = /is_valid:true/;
    const valid = validRegex.test(auth_validation);
    if (!valid) {
      const error = createError({
        statusCode: 401,
        message: "Steam login failed: Claimed identity is invalid."
      });
      if (!onError) throw error;
      return onError(event, error);
    }
    const idRegex = /^https?:\/\/steamcommunity\.com\/openid\/id\/(\d+)$/;
    const steamIdCheck = idRegex.exec(query["openid.claimed_id"]);
    const steamId = steamIdCheck?.[1];
    const user = await $fetch(withQuery("https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/", {
      key: config.apiKey,
      steamids: steamId
    }));
    return onSuccess(event, {
      user: user.response.players[0],
      tokens: null
    });
  });
}
