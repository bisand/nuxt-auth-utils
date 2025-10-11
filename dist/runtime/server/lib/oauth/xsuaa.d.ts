import type { OAuthConfig } from '#auth-utils';
export interface OAuthXSUAAConfig {
    /**
     * XSUAA OAuth Client ID
     * @default process.env.NUXT_OAUTH_XSUAA_CLIENT_ID
     */
    clientId?: string;
    /**
     * XSUAA OAuth Client Secret
     * @default process.env.NUXT_OAUTH_XSUAA_CLIENT_SECRET
     */
    clientSecret?: string;
    /**
     * XSUAA OAuth Issuer
     * @default process.env.NUXT_OAUTH_XSUAA_DOMAIN
     */
    domain?: string;
    /**
     * XSUAA OAuth Scope
     * @default []
     * @see https://sap.github.io/cloud-sdk/docs/java/guides/cloud-foundry-xsuaa-service
     * @example ['openid']
     */
    scope?: string[];
    /**
     * Redirect URL to to allow overriding for situations like prod failing to determine public hostname
     * @default process.env.NUXT_OAUTH_XSUAA_REDIRECT_URL or current URL
     */
    redirectURL?: string;
}
export declare function defineOAuthXSUAAEventHandler({ config, onSuccess, onError }: OAuthConfig<OAuthXSUAAConfig>): import("h3").EventHandler<import("h3").EventHandlerRequest, Promise<any>>;
