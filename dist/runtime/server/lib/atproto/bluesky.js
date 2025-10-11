import { createError, eventHandler, getQuery, sendRedirect, getCookie, setCookie, deleteCookie } from "h3";
import { NodeOAuthClient, OAuthCallbackError, OAuthResolverError, OAuthResponseError } from "@atproto/oauth-client-node";
import { Agent } from "@atproto/api";
import { getAtprotoClientMetadata } from "../../utils/atproto.js";
export function defineOAuthBlueskyEventHandler({ config, onSuccess, onError }) {
  return eventHandler(async (event) => {
    const clientMetadata = getAtprotoClientMetadata(event, "bluesky", config);
    const scopes = clientMetadata.scope?.split(" ") ?? [];
    const sessionStore = new SessionStore();
    const stateStore = new StateStore(event);
    const client = new NodeOAuthClient({
      stateStore,
      sessionStore,
      clientMetadata
    });
    const query = getQuery(event);
    if (!query.code) {
      try {
        const handle = query.handle?.toString();
        if (!handle) throw createError({
          statusCode: 400,
          message: "Query parameter `handle` empty or missing. Please provide a valid Bluesky handle."
        });
        const url = await client.authorize(handle, { scope: clientMetadata.scope });
        return sendRedirect(event, url.toString());
      } catch (err) {
        const error = (() => {
          switch (true) {
            case err instanceof OAuthResponseError:
              return createError({
                statusCode: 500,
                message: `Bluesky login failed: ${err.errorDescription || "Unknown error"}`,
                data: err.payload
              });
            case err instanceof OAuthResolverError:
              return createError({
                statusCode: 400,
                message: `Bluesky login failed: ${err.message || "Unknown error"}`
              });
            default:
              throw err;
          }
        })();
        if (!onError) throw error;
        return onError(event, error);
      }
    }
    try {
      const { session } = await client.callback(new URLSearchParams(query));
      const sessionInfo = await sessionStore.get(session.did);
      const profile = scopes.includes("transition:generic") ? (await new Agent(session).getProfile({ actor: session.did })).data : null;
      sessionStore.del(session.did);
      return onSuccess(event, {
        user: profile ?? { did: session.did },
        tokens: sessionInfo.tokenSet
      });
    } catch (err) {
      if (!(err instanceof OAuthCallbackError)) throw err;
      const error = createError({
        statusCode: 500,
        message: `Bluesky login failed: ${err.message || "Unknown error"}`
      });
      if (!onError) throw error;
      return onError(event, error);
    }
  });
}
export class StateStore {
  constructor(event) {
    this.event = event;
  }
  stateKey = "oauth-bluesky-state";
  async get() {
    const result = getCookie(this.event, this.stateKey);
    if (!result) return;
    return JSON.parse(atob(result));
  }
  async set(key, val) {
    setCookie(this.event, this.stateKey, btoa(JSON.stringify(val)), {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax"
    });
  }
  async del() {
    deleteCookie(this.event, this.stateKey);
  }
}
export class SessionStore {
  store = {};
  async get(key) {
    return this.store[key];
  }
  async set(key, val) {
    this.store[key] = val;
  }
  async del(key) {
    delete this.store[key];
  }
}
