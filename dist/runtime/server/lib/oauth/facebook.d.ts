import type { OAuthConfig } from '#auth-utils';
export interface OAuthFacebookConfig {
    /**
     * Facebook OAuth Client ID
     * @default process.env.NUXT_OAUTH_FACEBOOK_CLIENT_ID
     */
    clientId?: string;
    /**
     * Facebook OAuth Client Secret
     * @default process.env.NUXT_OAUTH_FACEBOOK_CLIENT_SECRET
     */
    clientSecret?: string;
    /**
     * Facebook OAuth Scope
     * @default []
     * @see https://developers.facebook.com/docs/permissions
     * @example [ 'email' ],
     */
    scope?: string[];
    /**
     * Facebook OAuth User Fields
     * @default [ 'id', 'name'],
     * @see https://developers.facebook.com/docs/graph-api/guides/field-expansion
     * @example [ 'id', 'name', 'email' ],
     */
    fields?: string[];
    /**
     * Facebook OAuth Authorization URL
     * @default 'https://www.facebook.com/v19.0/dialog/oauth'
     */
    authorizationURL?: string;
    /**
     * Facebook OAuth Token URL
     * @default 'https://graph.facebook.com/v19.0/oauth/access_token'
     */
    tokenURL?: string;
    /**
     * Extra authorization parameters to provide to the authorization URL
     * @see https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow/
     */
    authorizationParams?: Record<string, string>;
    /**
     * Redirect URL to allow overriding for situations like prod failing to determine public hostname
     * @default process.env.NUXT_OAUTH_FACEBOOK_REDIRECT_URL or current URL
     */
    redirectURL?: string;
}
export declare function defineOAuthFacebookEventHandler({ config, onSuccess, onError, }: OAuthConfig<OAuthFacebookConfig>): import("h3").EventHandler<import("h3").EventHandlerRequest, Promise<any>>;
