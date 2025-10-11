import type { H3Event } from 'h3';
import type { NodeSavedSession, NodeSavedSessionStore, NodeSavedState, NodeSavedStateStore } from '@atproto/oauth-client-node';
import type { AppBskyActorDefs } from '@atproto/api';
import type { OAuthConfig } from '#auth-utils';
export interface OAuthBlueskyConfig {
    /**
     * Redirect URL to use for this authorization flow. It should only consist of the path, as the hostname must always match the client id's hostname.
     * @default process.env.NUXT_OAUTH_BLUESKY_REDIRECT_URL
     * @example '/auth/bluesky'
     */
    redirectUrl?: string;
    /**
     * Bluesky OAuth Scope. The `atproto` scope is required and will be added if not present.
     * @default ['atproto']
     * @see https://atproto.com/specs/oauth#authorization-scopes
     * @example ['atproto', 'transition:generic']
     */
    scope?: string[];
}
type BlueSkyUser = AppBskyActorDefs.ProfileViewDetailed | Pick<AppBskyActorDefs.ProfileView, 'did'>;
type BlueSkyTokens = NodeSavedSession['tokenSet'];
export declare function defineOAuthBlueskyEventHandler({ config, onSuccess, onError }: OAuthConfig<OAuthBlueskyConfig, {
    user: BlueSkyUser;
    tokens: BlueSkyTokens;
}>): import("h3").EventHandler<import("h3").EventHandlerRequest, Promise<any>>;
export declare class StateStore implements NodeSavedStateStore {
    private event;
    private readonly stateKey;
    constructor(event: H3Event);
    get(): Promise<NodeSavedState | undefined>;
    set(key: string, val: NodeSavedState): Promise<void>;
    del(): Promise<void>;
}
export declare class SessionStore implements NodeSavedSessionStore {
    private store;
    get(key: string): Promise<NodeSavedSession | undefined>;
    set(key: string, val: NodeSavedSession): Promise<void>;
    del(key: string): Promise<void>;
}
export {};
