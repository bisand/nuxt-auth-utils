import type { OAuthConfig } from '#auth-utils';
export interface OAuthRobloxConfig {
    /**
     * Roblox OAuth Client ID
     * @default process.env.NUXT_OAUTH_ROBLOX_CLIENT_ID
     */
    clientId?: string;
    /**
     * Roblox OAuth Client Secret
     * @default process.env.NUXT_OAUTH_ROBLOX_CLIENT_SECRET
     */
    clientSecret?: string;
    /**
     * Roblox OAuth Scope
     * Some scopes and claims listed are only available to official Roblox apps, e.g. email
     * @default ['openid', 'profile']
     * @see https://apis.roblox.com/oauth/.well-known/openid-configuration
     * @example ['openid', 'profile', 'asset:read', 'universe-messaging-service:publish']
     */
    scope?: string[];
    /**
     * Roblox OAuth Authorization URL
     * @default 'https://apis.roblox.com/oauth/v1/authorize'
     */
    authorizationURL?: string;
    /**
     * Roblox OAuth Token URL
     * @default 'https://apis.roblox.com/oauth/v1/token'
     */
    tokenURL?: string;
    /**
     * Extra authorization parameters to provide to the authorization URL
     * @see https://create.roblox.com/docs/cloud/auth/oauth2-reference#get-v1authorize
     */
    authorizationParams?: Record<string, string>;
    /**
     * Redirect URL to allow overriding for situations like prod failing to determine public hostname
     * @default process.env.NUXT_OAUTH_ROBLOX_REDIRECT_URL or current URL
     */
    redirectURL?: string;
}
export interface OAuthRobloxUser {
    /**
     * The resource path of the user
     * @example "users/123"
     */
    path: string;
    /**
     * The timestamp at which the user was created
     * @readonly
     * @example "2023-07-05T12:34:56Z"
     */
    createTime: string;
    /**
     * Unique ID that identifies a user in Roblox
     * @readonly
     * @example "123456"
     */
    id: string;
    /**
     * Unique username for a user in Roblox
     * @example "exampleUser"
     */
    name: string;
    /**
     * Display name for the user
     * @example "userDefinedName"
     */
    displayName: string;
    /**
     * User-defined information about themselves
     * @example "Example User's bio"
     */
    about: string;
    /**
     * Current locale selected by the user as an IETF language code
     * @example "en-US"
     */
    locale: string;
    /**
     * Whether the user is a premium user
     * @readonly
     * @example true
     */
    premium: boolean;
    /**
     * Specifies if the user is identity-verified
     * Verification includes, but isn't limited to, non-VoIP phone numbers or government IDs
     * Available only with the user.advanced:read scope
     * @readonly
     * @example true
     */
    idVerified: boolean;
    /**
     * User's social network profiles and visibility.
     */
    socialNetworkProfiles: {
        /**
         * Facebook profile URI.
         */
        facebook?: string;
        /**
         * Twitter profile URI.
         */
        twitter?: string;
        /**
         * YouTube profile URI.
         */
        youtube?: string;
        /**
         * Twitch profile URI.
         */
        twitch?: string;
        /**
         * Guilded profile URI.
         */
        guilded?: string;
        /**
         * Visibility of the social network profiles.
         * Available only with the user.social:read scope
         * @example "SOCIAL_NETWORK_VISIBILITY_UNSPECIFIED"
         */
        visibility: 'SOCIAL_NETWORK_VISIBILITY_UNSPECIFIED' | 'NO_ONE' | 'FRIENDS' | 'FRIENDS_AND_FOLLOWING' | 'FRIENDS_FOLLOWING_AND_FOLLOWERS' | 'EVERYONE';
    };
}
export declare function defineOAuthRobloxEventHandler({ config, onSuccess, onError }: OAuthConfig<OAuthRobloxConfig>): import("h3").EventHandler<import("h3").EventHandlerRequest, Promise<any>>;
