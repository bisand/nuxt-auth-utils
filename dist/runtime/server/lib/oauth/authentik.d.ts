import type { OAuthConfig } from '#auth-utils';
export interface OAuthAuthentikConfig {
    /**
     * Authentik OAuth Client ID
     * @default process.env.NUXT_OAUTH_AUTHENTIK_CLIENT_ID
     */
    clientId?: string;
    /**
     * Authentik OAuth Client Secret
     * @default process.env.NUXT_OAUTH_AUTHENTIK_CLIENT_SECRET
     */
    clientSecret?: string;
    /**
     * Authentik OAuth Domain
     * @example https://<your-authentik-instance>
     * @default process.env.NUXT_OAUTH_AUTHENTIK_DOMAIN
     */
    domain?: string;
    /**
     * Redirect URL to allow overriding for situations like prod failing to determine public hostname
     * @default process.env.NUXT_OAUTH_AUTHENTIK_REDIRECT_URL or current URL
     */
    redirectURL?: string;
    /**
     * Authentik Scope
     * @default ['openid', 'profile', 'email']
     */
    scope?: string[];
}
export declare function defineOAuthAuthentikEventHandler({ config, onSuccess, onError }: OAuthConfig<OAuthAuthentikConfig>): import("h3").EventHandler<import("h3").EventHandlerRequest, Promise<any>>;
