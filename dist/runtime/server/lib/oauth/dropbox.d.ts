import type { OAuthConfig } from '#auth-utils';
export interface OAuthDropboxConfig {
    /**
     * Dropbox Client ID
     * @default process.env.NUXT_OAUTH_DROPBOX_CLIENT_ID
     */
    clientId?: string;
    /**
     * Dropbox OAuth Client Secret
     * @default process.env.NUXT_OAUTH_DROPBOX_CLIENT_SECRET
     */
    clientSecret?: string;
    /**
     * Dropbox OAuth Scope
     * @default []
     * @see https://developers.dropbox.com/oauth-guide#dropbox-api-permissions
     * @example ['email', 'profile']
     */
    scope?: string[];
    /**
     * Require email from user, adds the ['email'] scope if not present
     * @default false
     */
    emailRequired?: boolean;
    /**
     * Dropbox OAuth Authorization URL
     * @default 'https://www.dropbox.com/oauth2/authorize'
     */
    authorizationURL?: string;
    /**
     * Dropbox OAuth Token URL
     * @default 'https://api.dropboxapi.com/oauth2/token'
     */
    tokenURL?: string;
    /**
     * Extra authorization parameters to provide to the authorization URL
     * @see https://www.dropbox.com/developers/documentation/http/documentation#authorization
     * @example { locale: 'en-US' }
     */
    authorizationParams?: Record<string, string>;
    /**
     * Redirect URL to to allow overriding for situations like prod failing to determine public hostname
     * @default process.env.NUXT_OAUTH_DROPBOX_REDIRECT_URL or current URL
     */
    redirectURL?: string;
}
export declare function defineOAuthDropboxEventHandler({ config, onSuccess, onError }: OAuthConfig<OAuthDropboxConfig>): import("h3").EventHandler<import("h3").EventHandlerRequest, Promise<any>>;
