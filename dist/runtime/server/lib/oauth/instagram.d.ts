import type { OAuthConfig } from '#auth-utils';
export interface OAuthInstagramConfig {
    /**
     * Instagram OAuth Client ID
     * @default process.env.NUXT_OAUTH_INSTAGRAM_CLIENT_ID
     */
    clientId?: string;
    /**
     * Instagram OAuth Client Secret
     * @default process.env.NUXT_OAUTH_INSTAGRAM_CLIENT_SECRET
     */
    clientSecret?: string;
    /**
     * Instagram OAuth Scope
     * @required [ 'business_basic' ]
     * @see https://developers.facebook.com/docs/instagram-basic-display-api/overview#permissions
     * @example [ 'business_basic', 'business_manage_messages' ],
     */
    scope?: ('business_basic' | 'business_content_publish' | 'business_manage_comments' | 'business_manage_messages')[];
    /**
     * Instagram OAuth User Fields
     * @default [ 'id', 'username'],
     * @see https://developers.facebook.com/docs/instagram-basic-display-api/reference/user#fields
     * @example [ 'id', 'username', 'user_id', 'account_type', 'profile_picture_url' ],
     */
    fields?: ('id' | 'user_id' | 'username' | 'name' | 'account_type' | 'profile_picture_url' | 'followers_count' | 'follows_count' | 'media_count')[];
    /**
     * Instagram OAuth Authorization URL
     * @default 'https://www.instagram.com/oauth/authorize'
     */
    authorizationURL?: string;
    /**
     * Instagram OAuth Token URL
     * @default 'https://api.instagram.com/oauth/access_token'
     */
    tokenURL?: string;
    /**
     * Extra authorization parameters to provide to the authorization URL
     * @see https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow/
     */
    authorizationParams?: Record<string, string>;
    /**
     * Redirect URL to to allow overriding for situations like prod failing to determine public hostname
     * @default process.env.NUXT_OAUTH_INSTAGRAM_REDIRECT_URL or current URL
     */
    redirectURL?: string;
}
export declare function defineOAuthInstagramEventHandler({ config, onSuccess, onError, }: OAuthConfig<OAuthInstagramConfig>): import("h3").EventHandler<import("h3").EventHandlerRequest, Promise<any>>;
