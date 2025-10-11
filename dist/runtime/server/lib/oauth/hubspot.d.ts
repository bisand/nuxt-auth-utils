import type { OAuthConfig } from '#auth-utils';
export interface OAuthHubspotConfig {
    /**
     * Hubspot OAuth Client ID
     * @default process.env.NUXT_OAUTH_HUBSPOT_CLIENT_ID
     */
    clientId?: string;
    /**
     * Hubspot OAuth Client Secret
     * @default process.env.NUXT_OAUTH_HUBSPOT_CLIENT_SECRET
     */
    clientSecret?: string;
    /**
     * Hubspot OAuth Redirect URL
     * @default process.env.NUXT_OAUTH_HUBSPOT_REDIRECT_URL
     */
    redirectURL?: string;
    /**
     * Hubspot OAuth Scope
     * @default ['oauth']
     * @see https://developers.hubspot.com/beta-docs/guides/apps/authentication/scopes
     * @example ['accounting', 'automation', 'actions']
     */
    scope?: string[];
}
export declare function defineOAuthHubspotEventHandler({ config, onSuccess, onError }: OAuthConfig<OAuthHubspotConfig>): import("h3").EventHandler<import("h3").EventHandlerRequest, Promise<any>>;
