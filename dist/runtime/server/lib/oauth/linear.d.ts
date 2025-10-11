import type { OAuthConfig } from '#auth-utils';
export interface OAuthLinearConfig {
    /**
     * Linear OAuth Client ID
     * @default process.env.NUXT_OAUTH_LINEAR_CLIENT_ID
     */
    clientId?: string;
    /**
     * Linear OAuth Client Secret
     * @default process.env.NUXT_OAUTH_LINEAR_CLIENT_SECRET
     */
    clientSecret?: string;
    /**
     * Linear OAuth Scope
     * @default ['read']
     * @see https://developers.linear.app/docs/oauth/authentication#scopes
     * @example ['read', 'write', 'issues:create', 'comments:create', 'timeSchedule:write', 'admin']
     */
    scope?: string[];
    /**
     * Linear OAuth Authorization URL
     * @default 'https://linear.app/oauth/authorize'
     */
    authorizationURL?: string;
    /**
     * Linear OAuth Token URL
     * @default 'https://api.linear.app/oauth/token'
     */
    tokenURL?: string;
    /**
     * Extra authorization parameters to provide to the authorization URL
     * @see https://developers.linear.app/docs/oauth/authentication#id-2.-redirect-user-access-requests-to-linear
     */
    authorizationParams?: Record<string, string>;
    /**
     * Redirect URL to allow overriding for situations like prod failing to determine public hostname
     * @default process.env.NUXT_OAUTH_LINEAR_REDIRECT_URL or current URL
     */
    redirectURL?: string;
}
export declare function defineOAuthLinearEventHandler({ config, onSuccess, onError }: OAuthConfig<OAuthLinearConfig>): import("h3").EventHandler<import("h3").EventHandlerRequest, Promise<any>>;
