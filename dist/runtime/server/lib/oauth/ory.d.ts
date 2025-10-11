import type { OAuthConfig } from '#auth-utils';
/**
 * Ory OAuth2
 * @see https://www.ory.sh/docs/oauth2-oidc/authorization-code-flow
 */
export interface OAuthOryConfig {
    /**
     * Ory OAuth Client ID
     * @default process.env.NUXT_OAUTH_ORY_CLIENT_ID
     */
    clientId?: string;
    /**
     * Ory OAuth Client Secret
     * @default process.env.NUXT_OAUTH_ORY_CLIENT_SECRET
     */
    clientSecret?: string;
    /**
     * Ory OAuth SDK URL
     * @default "https://playground.projects.oryapis.com" || process.env.NUXT_OAUTH_ORY_SDK_URL
     */
    sdkURL?: string;
    /**
     * Ory OAuth Scope
     * @default ['openid', 'offline']
     * @see https://www.ory.sh/docs/oauth2-oidc/openid-connect-claims-scope-custom
     * @example ['openid', 'offline', 'email']
     */
    scope?: string[] | string;
    /**
     * Ory OAuth Authorization URL
     * @default '/oauth2/auth'
     */
    authorizationURL?: string;
    /**
     * Ory OAuth Token URL
     * @default '/oauth2/token'
     */
    tokenURL?: string;
    /**
     * Extra authorization parameters to provide to the authorization URL
     * @example { allow_signup: 'true' }
     */
    authorizationParams?: Record<string, string>;
    /**
     * Ory OAuth Userinfo URL
     * @see https://www.ory.sh/docs/oauth2-oidc/userinfo-oidc
     * @default '/userinfo'
     */
    userURL?: string;
}
export declare function defineOAuthOryEventHandler({ config, onSuccess, onError }: OAuthConfig<OAuthOryConfig>): import("h3").EventHandler<import("h3").EventHandlerRequest, Promise<any>>;
