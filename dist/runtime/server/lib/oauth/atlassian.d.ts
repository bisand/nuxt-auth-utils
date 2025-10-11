import type { OAuthConfig } from '#auth-utils';
interface AtlassianUser {
    account_id?: string;
    email?: string;
    name?: string;
    picture?: string;
    account_status?: string;
    characteristics?: {
        not_mentionable?: boolean;
    };
    last_updated?: string;
    nickname?: string;
    locale?: string;
    extended_profile?: {
        phone_numbers?: string[];
    };
    account_type?: string;
    email_verified?: boolean;
}
interface AtlassianTokens {
    access_token?: string;
    expires_in?: number;
    token_type?: string;
    scope?: string;
    error?: string;
}
/**
 * @see https://developer.atlassian.com/cloud/jira/platform/oauth-2-3lo-apps
 */
export interface OAuthAtlassianConfig {
    /**
     * Atlassian OAuth Client ID
     * @default process.env.NUXT_OAUTH_ATLASSIAN_CLIENT_ID
     * @see https://developer.atlassian.com/console/myapps
     */
    clientId?: string;
    /**
     * Atlassian OAuth Client Secret
     * @default process.env.NUXT_OAUTH_ATLASSIAN_CLIENT_SECRET
     * @see https://developer.atlassian.com/console/myapps
     */
    clientSecret?: string;
    /**
     * Redirect URL to allow overriding for situations like prod failing to determine public hostname
     * @default process.env.NUXT_OAUTH_ATLASSIAN_REDIRECT_URL or current URL
     * @see https://developer.atlassian.com/console/myapps
     */
    redirectURL?: string;
    /**
     * Atlassian OAuth Scope
     * @default ['read:me', 'read:account']
     * @see [Jira scopes](https://developer.atlassian.com/cloud/jira/platform/scopes-for-oauth-2-3LO-and-forge-apps) | [Confluence scopes](https://developer.atlassian.com/cloud/confluence/scopes-for-oauth-2-3LO-and-forge-apps)
     *
     * @example
     * User identity API: ['read:me', 'read:account']
     * Confluence API: ['read:confluence-user']
     * BRIE API: ['read:account:brie]
     * Jira platform REST API: ['read:jira-user']
     * Personal data reporting API: ['report:personal-data']
     */
    scope?: string[];
    /**
     * Atlassian OAuth Audience URL
     * @default 'https://api.atlassian.com'
     */
    audienceURL?: string;
    /**
     * Atlassian OAuth Authorization URL
     * @default 'https://auth.atlassian.com/authorize'
     */
    authorizationURL?: string;
    /**
     * Atlassian OAuth Token URL
     * @default 'https://auth.atlassian.com/oauth/token'
     */
    tokenURL?: string;
    /**
     * Require email from user, adds the ['read:me'] scope if not present
     * @default false
     */
    emailHasToBeVerified?: boolean;
    /**
     * Extra authorization parameters to provide to the authorization URL
     * @default {}
     */
    authorizationParams?: Record<string, string>;
}
/**
 * Atlassian User identity, Confluence, BRIE, Jira platform, Atlassian Personal data reporting
 */
export declare function defineOAuthAtlassianEventHandler({ config, onSuccess, onError, }: OAuthConfig<OAuthAtlassianConfig, {
    user: AtlassianUser;
    tokens: AtlassianTokens;
}>): import("h3").EventHandler<import("h3").EventHandlerRequest, Promise<any>>;
export {};
