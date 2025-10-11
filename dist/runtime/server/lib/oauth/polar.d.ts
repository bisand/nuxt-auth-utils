import type { OAuthConfig } from '#auth-utils';
export interface OAuthPolarConfig {
    /**
     * Polar Client ID
     * @default process.env.NUXT_OAUTH_POLAR_CLIENT_ID
     */
    clientId?: string;
    /**
     * Polar OAuth Client Secret
     * @default process.env.NUXT_OAUTH_POLAR_CLIENT_SECRET
     */
    clientSecret?: string;
    /**
     * Polar OAuth Scope
     * @default []
     * @see https://api.polar.sh/.well-known/openid-configuration
     * @example ['openid']
     */
    scope?: string[];
    /**
     * Require email from user, adds the ['email'] scope if not present
     * @default false
     */
    emailRequired?: boolean;
    /**
     * Polar OAuth Authorization URL
     * @see https://docs.polar.sh/api/authentication#start-the-authorization-flow
     * @default 'https://polar.sh/oauth2/authorize'
     */
    authorizationURL?: string;
    /**
     * Polar OAuth Token URL
     * @see https://docs.polar.sh/api/authentication#exchange-the-authorization-code
     * @default 'https://api.polar.sh/v1/oauth2/token'
     */
    tokenURL?: string;
    /**
     * Extra authorization parameters to provide to the authorization URL
     * @see https://docs.polar.sh/api/authentication#user-vs-organization-access-tokens
     * @example { sub_type: 'organization' }
     */
    authorizationParams?: Record<string, string>;
    /**
     * Redirect URL to to allow overriding for situations like prod failing to determine public hostname
     * @default process.env.NUXT_OAUTH_POLAR_REDIRECT_URL or current URL
     */
    redirectURL?: string;
}
export declare function defineOAuthPolarEventHandler({ config, onSuccess, onError }: OAuthConfig<OAuthPolarConfig>): import("h3").EventHandler<import("h3").EventHandlerRequest, Promise<any>>;
