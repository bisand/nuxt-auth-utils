import { eventHandler, getQuery, sendRedirect, getRequestIP, getRequestHeader } from "h3";
import { withQuery } from "ufo";
import { defu } from "defu";
import { handleMissingConfiguration, handleAccessTokenErrorResponse, getOAuthRedirectURL, requestAccessToken } from "../utils.js";
import { useRuntimeConfig } from "#imports";
export function defineOAuthWorkOSEventHandler({ config, onSuccess, onError }) {
  return eventHandler(async (event) => {
    config = defu(config, useRuntimeConfig(event).oauth?.workos, { screen_hint: "sign-in" });
    if (!config.clientId || !config.clientSecret) {
      return handleMissingConfiguration(event, "workos", ["clientId", "clientSecret"], onError);
    }
    const query = getQuery(event);
    const redirectURL = config.redirectURL || getOAuthRedirectURL(event);
    if (query.error) {
      return handleAccessTokenErrorResponse(event, "workos", query, onError);
    }
    if (!query.code) {
      return sendRedirect(
        event,
        withQuery("https://api.workos.com/user_management/authorize", {
          response_type: "code",
          provider: "authkit",
          client_id: config.clientId,
          redirect_uri: redirectURL || void 0,
          connection_id: config.connectionId || void 0,
          screen_hint: config.screenHint || "sign-in",
          organization_id: config.organizationId || void 0
        })
      );
    }
    const authenticateResponse = await requestAccessToken("https://api.workos.com/user_management/authenticate", {
      headers: {
        "Content-Type": "application/json"
      },
      body: {
        grant_type: "authorization_code",
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: redirectURL,
        ip_address: getRequestIP(event),
        user_agent: getRequestHeader(event, "user-agent"),
        code: query.code
      }
    });
    if (authenticateResponse.error) {
      return handleAccessTokenErrorResponse(event, "workos", authenticateResponse, onError);
    }
    return onSuccess(event, {
      tokens: { access_token: authenticateResponse.access_token, refresh_token: authenticateResponse.refresh_token },
      user: authenticateResponse.user
    });
  });
}
