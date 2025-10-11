import type { OAuthConfig } from '#auth-utils';
export interface OAuthZitadelConfig {
    /**
     * ZITADEL OAuth Client ID
     * @default process.env.NUXT_OAUTH_ZITADEL_CLIENT_ID
     */
    clientId?: string;
    /**
     * ZITADEL OAuth Client Secret
     * @default process.env.NUXT_OAUTH_ZITADEL_CLIENT_SECRET
     */
    clientSecret?: string;
    /**
     * ZITADEL OAuth Domain
     * @example <your-zitadel-instance>.zitadel.cloud
     * @default process.env.NUXT_OAUTH_ZITADEL_DOMAIN
     */
    domain?: string;
    /**
     * ZITADEL OAuth Scope
     * @default ['openid']
     * @see https://zitadel.com/docs/apis/openidoauth/scopes
     * @example ['openid', 'profile', 'email']
     */
    scope?: string[];
    /**
     * Extra authorization parameters to provide to the authorization URL
     * @example { ui_locales: 'de-CH de en' }
     */
    authorizationParams?: Record<string, string>;
    /**
     * Redirect URL to allow overriding for situations like prod failing to determine public hostname
     * @default process.env.NUXT_OAUTH_ZITADEL_REDIRECT_URL or current URL
     */
    redirectURL?: string;
}
export declare function defineOAuthZitadelEventHandler({ config, onSuccess, onError }: OAuthConfig<OAuthZitadelConfig>): import("h3").EventHandler<import("h3").EventHandlerRequest, Promise<any>>;
