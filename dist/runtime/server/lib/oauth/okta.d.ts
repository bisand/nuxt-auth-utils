import type { H3Event } from 'h3';
import type { OAuthConfig } from '#auth-utils';
export interface OpenIdConfig {
    authorization_endpoint: string;
    token_endpoint: string;
    userinfo_endpoint: string;
    end_session_endpoint?: string;
    [key: string]: unknown;
}
export interface OAuthConfigExt<TConfig, TResult = {
    user: Record<string, unknown>;
    tokens: Record<string, unknown>;
    openIdConfig: OpenIdConfig;
}> extends OAuthConfig<TConfig, TResult> {
    config?: TConfig;
    onSuccess: (event: H3Event, result: TResult) => Promise<void> | void;
    onError?: (event: H3Event, error: unknown) => Promise<void> | void;
}
export interface OAuthOktaConfig {
    /**
     * Okta OAuth Client ID
     * @default process.env.NUXT_OAUTH_OKTA_CLIENT_ID
     */
    clientId?: string;
    /**
     * Okta OAuth Client Secret
     * @default process.env.NUXT_OAUTH_OKTA_CLIENT_SECRET
     */
    clientSecret?: string;
    /**
     * Okta OAuth Issuer
     * @default process.env.NUXT_OAUTH_OKTA_DOMAIN
     */
    domain?: string;
    /**
     * Okta OAuth Authorization Server
     * @see https://developer.okta.com/docs/guides/customize-authz-server/main/#create-an-authorization-server
     * @default process.env.NUXT_OAUTH_OKTA_AUTHORIZATION_SERVER
     */
    authorizationServer?: string;
    /**
     * Okta OAuth Audience
     * @default process.env.NUXT_OAUTH_OKTA_AUDIENCE
     */
    audience?: string;
    /**
     * Okta OAuth Scope
     * @default []
     * @see https://okta.com/docs/get-started/apis/scopes/openid-connect-scopes
     * @example ['openid']
     */
    scope?: string | string[];
    /**
     * Require email from user, adds the ['email'] scope if not present
     * @default false
     */
    emailRequired?: boolean;
    /**
     * Maximum Authentication Age. If the elapsed time is greater than this value, the OP must attempt to actively re-authenticate the end-user.
     * @default 0
     * @see https://okta.com/docs/authenticate/login/max-age-reauthentication
     */
    maxAge?: number;
    /**
     * Login connection. If no connection is specified, it will redirect to the standard Okta login page and show the Login Widget.
     * @default ''
     * @see https://okta.com/docs/api/authentication#social
     * @example 'github'
     */
    connection?: string;
    /**
     * Extra authorization parameters to provide to the authorization URL
     * @see https://okta.com/docs/api/authentication#social
     * @example { display: 'popup' }
     */
    authorizationParams?: Record<string, string>;
    /**
     * Redirect URL to to allow overriding for situations like prod failing to determine public hostname
     * @default process.env.NUXT_OAUTH_OKTA_REDIRECT_URL or current URL
     */
    redirectURL?: string;
    /**
     * OpenID Configuration cache TTL in milliseconds
     * @default 86400000 (24 hours)
     */
    openIdConfigCacheTTL?: number;
}
export declare function defineOAuthOktaEventHandler({ config, onSuccess, onError }: OAuthConfigExt<OAuthOktaConfig>): import("h3").EventHandler<import("h3").EventHandlerRequest, Promise<any>>;
