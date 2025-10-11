import type { OAuthConfig } from '#auth-utils';
export interface OAuthSpotifyConfig {
    /**
     * Spotify OAuth Client ID
     * @default process.env.NUXT_OAUTH_SPOTIFY_CLIENT_ID
     */
    clientId?: string;
    /**
     * Spotify OAuth Client Secret
     * @default process.env.NUXT_OAUTH_SPOTIFY_CLIENT_SECRET
     */
    clientSecret?: string;
    /**
     * Spotify OAuth Scope
     * @default []
     * @see https://developer.spotify.com/documentation/web-api/concepts/scopes
     * @example ['user-read-email']
     */
    scope?: string[];
    /**
     * Require email from user, adds the ['user-read-email'] scope if not present
     * @default false
     */
    emailRequired?: boolean;
    /**
     * Spotify OAuth Authorization URL
     * @default 'https://accounts.spotify.com/authorize'
     */
    authorizationURL?: string;
    /**
     * Spotify OAuth Token URL
     * @default 'https://accounts.spotify.com/api/token'
     */
    tokenURL?: string;
    /**
     * Extra authorization parameters to provide to the authorization URL
     * @see 'https://developer.spotify.com/documentation/web-api/tutorials/code-flow'
     * @example { show_dialog: 'true' }
     */
    authorizationParams?: Record<string, string>;
    /**
     * Redirect URL to to allow overriding for situations like prod failing to determine public hostname
     * @default process.env.NUXT_OAUTH_SPOTIFY_REDIRECT_URL or current URL
     */
    redirectURL?: string;
}
export declare function defineOAuthSpotifyEventHandler({ config, onSuccess, onError }: OAuthConfig<OAuthSpotifyConfig>): import("h3").EventHandler<import("h3").EventHandlerRequest, Promise<any>>;
