import type { OAuthConfig } from '#auth-utils';
export interface OAuthLineConfig {
    /**
     * Line OAuth Client ID
     * @default process.env.NUXT_OAUTH_LINE_CLIENT_ID
     */
    clientId?: string;
    /**
     * Line OAuth Client Secret
     * @default process.env.NUXT_OAUTH_LINE_CLIENT_SECRET
     */
    clientSecret?: string;
    /**
     * Line OAuth Scope
     * @default ['profile', 'openid']
     * @see https://developers.line.biz/en/docs/line-login/integrate-line-login/
     */
    scope?: string[];
    /**
     * Line OAuth Authorization URL
     * @default 'https://access.line.me/oauth2/v2.1/authorize'
     */
    authorizationURL?: string;
    /**
     * Line OAuth Token URL
     * @default 'https://api.line.me/oauth2/v2.1/token'
     */
    tokenURL?: string;
    /**
     * Line OAuth User Info URL
     * @default 'https://api.line.me/v2/profile'
     */
    userURL?: string;
    /**
     * Extra authorization parameters to provide to the authorization URL
     * @example { bot_prompt: 'normal' }
     */
    authorizationParams?: Record<string, string>;
    /**
     * Redirect URL to to allow overriding for situations like prod failing to determine public hostname
     * @default process.env.NUXT_OAUTH_LINE_REDIRECT_URL or current URL
     */
    redirectURL?: string;
}
export declare function defineOAuthLineEventHandler({ config, onSuccess, onError, }: OAuthConfig<OAuthLineConfig>): import("h3").EventHandler<import("h3").EventHandlerRequest, Promise<any>>;
