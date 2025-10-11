import type { OAuthConfig } from '#auth-utils';
export interface OAuthAuth0Config {
    /**
     * Auth0 OAuth Client ID
     * @default process.env.NUXT_OAUTH_AUTH0_CLIENT_ID
     */
    clientId?: string;
    /**
     * Auth0 OAuth Client Secret
     * @default process.env.NUXT_OAUTH_AUTH0_CLIENT_SECRET
     */
    clientSecret?: string;
    /**
     * Auth0 OAuth Issuer
     * @default process.env.NUXT_OAUTH_AUTH0_DOMAIN
     */
    domain?: string;
    /**
     * Auth0 OAuth Audience
     * @default process.env.NUXT_OAUTH_AUTH0_AUDIENCE
     */
    audience?: string;
    /**
     * Auth0 OAuth Scope
     * @default []
     * @see https://auth0.com/docs/get-started/apis/scopes/openid-connect-scopes
     * @example ['openid']
     */
    scope?: string[];
    /**
     * Require email from user, adds the ['email'] scope if not present
     * @default false
     */
    emailRequired?: boolean;
    /**
     * Maximum Authentication Age. If the elapsed time is greater than this value, the OP must attempt to actively re-authenticate the end-user.
     * @default 0
     * @see https://auth0.com/docs/authenticate/login/max-age-reauthentication
     */
    maxAge?: number;
    /**
     * Login connection. If no connection is specified, it will redirect to the standard Auth0 login page and show the Login Widget.
     * @default ''
     * @see https://auth0.com/docs/api/authentication#social
     * @example 'github'
     */
    connection?: string;
    /**
     * Extra authorization parameters to provide to the authorization URL
     * @see https://auth0.com/docs/api/authentication#social
     * @example { display: 'popup' }
     */
    authorizationParams?: Record<string, string>;
    /**
     * Redirect URL to to allow overriding for situations like prod failing to determine public hostname
     * @default process.env.NUXT_OAUTH_AUTH0_REDIRECT_URL or current URL
     */
    redirectURL?: string;
}
export declare function defineOAuthAuth0EventHandler({ config, onSuccess, onError }: OAuthConfig<OAuthAuth0Config>): import("h3").EventHandler<import("h3").EventHandlerRequest, Promise<any>>;
