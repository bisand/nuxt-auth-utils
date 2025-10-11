import type { OAuthConfig } from '#auth-utils';
export interface OAuthXConfig {
    /**
     * X OAuth Client ID
     * @default process.env.NUXT_OAUTH_X_CLIENT_ID
     */
    clientId?: string;
    /**
     * X OAuth Client Secret
     * @default process.env.NUXT_OAUTH_X_CLIENT_SECRET
     */
    clientSecret?: string;
    /**
     * X OAuth Scope
     * @default []
     * @see https://developer.x.com/en/docs/authentication/oauth-2-0/user-access-token
     * @example ['tweet.read', 'users.read', 'offline.access'],
     */
    scope?: string[];
    /**
     * X OAuth Authorization URL
     * @default 'https://twitter.com/i/oauth2/authorize'
     */
    authorizationURL?: string;
    /**
     * X OAuth Token URL
     * @default 'https://api.twitter.com/2/oauth2/token'
     */
    tokenURL?: string;
    /**
     * X OAuth User URL
     * @default 'https://api.twitter.com/2/users/me'
     */
    userURL?: string;
    /**
     * Extra authorization parameters to provide to the authorization URL
     * @see https://developer.x.com/en/docs/authentication/oauth-2-0/user-access-token
     */
    authorizationParams?: Record<string, string>;
    /**
     * Redirect URL to to allow overriding for situations like prod failing to determine public hostname
     * @default process.env.NUXT_OAUTH_X_REDIRECT_URL or current URL
     */
    redirectURL?: string;
}
export declare function defineOAuthXEventHandler({ config, onSuccess, onError, }: OAuthConfig<OAuthXConfig>): import("h3").EventHandler<import("h3").EventHandlerRequest, Promise<any>>;
