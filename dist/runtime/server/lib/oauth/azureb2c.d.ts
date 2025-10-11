import type { OAuthConfig } from '#auth-utils';
export interface OAuthAzureB2CConfig {
    /**
     * Azure OAuth Client ID
     * @default process.env.NUXT_OAUTH_AZUREB2C_CLIENT_ID
     */
    clientId?: string;
    /**
     * Azure OAuth Policy
     * @default process.env.NUXT_OAUTH_AZUREB2C_POLICY
     */
    policy?: string;
    /**
     * Azure OAuth Tenant ID
     * @default process.env.NUXT_OAUTH_AZUREB2C_TENANT
     */
    tenant?: string;
    /**
     * Azure OAuth Scope
     * @default ['offline_access']
     * @see https://learn.microsoft.com/en-us/azure/active-directory-b2c/access-tokens#scopes
     */
    scope?: string[];
    /**
     * Azure OAuth Authorization URL
     * @default 'https://${tenant}.onmicrosoft.com/${policy}/oauth2/v2.0/token'
     * @see https://learn.microsoft.com/en-us/azure/active-directory-b2c/openid-connect
     */
    authorizationURL?: string;
    /**
     * Azure OAuth Token URL
     * @default 'https://${tenant}.onmicrosoft.com/${policy}/oauth2/v2.0/token'
     * @see https://learn.microsoft.com/en-us/azure/active-directory-b2c/openid-connect
     */
    tokenURL?: string;
    /**
     * Azure OAuth User URL
     * @default 'https://graph.microsoft.com/v1.0/me'
     * @see https://docs.microsoft.com/en-us/graph/api/user-get?view=graph-rest-1.0&tabs=http
     */
    userURL?: string;
    /**
     * Extra authorization parameters to provide to the authorization URL
     * @see https://learn.microsoft.com/en-us/azure/active-directory-b2c/authorization-code-flow
     */
    authorizationParams?: Record<string, string>;
    /**
     * Redirect URL to prevent in prod prevent redirect_uri mismatch http to https
     * @default process.env.NUXT_OAUTH_AZUREB2C_REDIRECT_URL
     * @see https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow
     */
    redirectURL?: string;
}
export declare function defineOAuthAzureB2CEventHandler({ config, onSuccess, onError }: OAuthConfig<OAuthAzureB2CConfig>): import("h3").EventHandler<import("h3").EventHandlerRequest, Promise<any>>;
