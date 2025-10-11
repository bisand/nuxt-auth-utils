import type { OAuthConfig } from '#auth-utils';
export interface OAuthSalesforceConfig {
    /**
     * Salesforce OAuth Client ID
     * @default process.env.NUXT_OAUTH_SALESFORCE_CLIENT_ID
     */
    clientId?: string;
    /**
     * Salesforce OAuth Client Secret
     * @default process.env.NUXT_OAUTH_SALESFORCE_CLIENT_SECRET
     */
    clientSecret?: string;
    /**
     * Salesforce OAuth Scope
     * @default ['id']
     * @see https://help.salesforce.com/s/articleView?id=xcloud.remoteaccess_oauth_tokens_scopes.htm
     * @example ['id']
     */
    scope?: string[];
    /**
     * Salesforce MyDomain URL
     * @default 'https://login.salesforce.com'
     */
    baseURL?: string;
    /**
     * Salesforce OAuth Authorization URL
     * @default 'https://login.salesforce.com/services/oauth2/authorize'
     */
    authorizationURL?: string;
    /**
     * Salesforce OAuth Authorization URL
     * @default 'https://login.salesforce.com/services/oauth2/token'
     */
    tokenURL?: string;
    /**
     * Extra authorization parameters to provide to the authorization URL
     * @default {}
     */
    authorizationParams?: Record<string, string>;
    /**
     * Redirect URL to allow overriding for situations like prod failing to determine public hostname
     * @default process.env.NUXT_OAUTH_SALESFORCE_REDIRECT_URL or current URL
     */
    redirectURL?: string;
}
export declare function defineOAuthSalesforceEventHandler({ config, onSuccess, onError, }: OAuthConfig<OAuthSalesforceConfig>): import("h3").EventHandler<import("h3").EventHandlerRequest, Promise<any>>;
