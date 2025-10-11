import type { OAuthConfig } from '#auth-utils';
export interface OAuthKickConfig {
    /**
     * Kick Client ID
     * @default process.env.NUXT_OAUTH_KICK_CLIENT_ID
     */
    clientId?: string;
    /**
     * Kick OAuth Client Secret
     * @default process.env.NUXT_OAUTH_KICK_CLIENT_SECRET
     */
    clientSecret?: string;
    /**
     * Kick OAuth Scope
     * @default []
     * @see https://docs.kick.com/getting-started/scopes
     * @example ['channel:read']
     */
    scope?: string[];
    /**
     * Kick OAuth Authorization URL
     * @see https://docs.kick.com/getting-started/generating-tokens-oauth2-flow#authorization-endpoint
     * @default 'https://id.kick.com/oauth/authorize'
     */
    authorizationURL?: string;
    /**
     * Kick OAuth Token URL
     * @see https://docs.kick.com/getting-started/generating-tokens-oauth2-flow#token-endpoint
     * @default 'https://id.kick.com/oauth/token'
     */
    tokenURL?: string;
    /**
     * Redirect URL to to allow overriding for situations like prod failing to determine public hostname
     * @default process.env.NUXT_OAUTH_KICK_REDIRECT_URL or current URL
     */
    redirectURL?: string;
}
export declare function defineOAuthKickEventHandler({ config, onSuccess, onError }: OAuthConfig<OAuthKickConfig>): import("h3").EventHandler<import("h3").EventHandlerRequest, Promise<any>>;
