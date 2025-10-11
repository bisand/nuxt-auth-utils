import type { OAuthConfig } from '#auth-utils';
export interface OAuthTikTokConfig {
    /**
     * TikTok Client Key
     * @default process.env.NUXT_OAUTH_TIKTOK_CLIENT_KEY
     */
    clientKey?: string;
    /**
     * TikTok OAuth Client Secret
     * @default process.env.NUXT_OAUTH_TIKTOK_CLIENT_SECRET
     */
    clientSecret?: string;
    /**
     * TikTok OAuth Scope
     * @default []
     * @see https://developers.tiktok.com/doc/tiktok-api-scopes/
     * @example ['user.info.basic']
     */
    scope?: string[];
    /**
     * Use TikTok sandbox environment.
     * If true it will use Login Kit for Desktop, if false it will use Login Kit for Web.
     * This is because Login Kit for Web doesn't support localhost or IP addresses as redirect URIs.
     * @see https://developers.tiktok.com/doc/login-kit-web/
     * @see https://developers.tiktok.com/doc/login-kit-desktop/
     * @default import.meta.dev // true in development, false in production
     */
    sandbox?: boolean;
    /**
     * TikTok OAuth Authorization URL
     * @default 'https://www.tiktok.com/v2/auth/authorize/'
     */
    authorizationURL?: string;
    /**
     * TikTok OAuth Token URL
     * @default 'https://open.tiktokapis.com/v2/oauth/token/'
     */
    tokenURL?: string;
    /**
     * Redirect URL to to allow overriding for situations like prod failing to determine public hostname
     * @default process.env.NUXT_OAUTH_TIKTOK_REDIRECT_URL or current URL
     */
    redirectURL?: string;
}
export declare function defineOAuthTikTokEventHandler({ config, onSuccess, onError }: OAuthConfig<OAuthTikTokConfig>): import("h3").EventHandler<import("h3").EventHandlerRequest, Promise<any>>;
