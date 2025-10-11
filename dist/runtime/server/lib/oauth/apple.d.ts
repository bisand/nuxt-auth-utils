import type { OAuthConfig } from '#auth-utils';
export interface OAuthAppleConfig {
    /**
     * Apple OAuth Client ID
     * @default process.env.NUXT_OAUTH_APPLE_CLIENT_ID
     */
    clientId?: string;
    /**
     * Apple OAuth team ID
     * @default process.env.NUXT_OAUTH_APPLE_TEAM_ID
     */
    teamId?: string;
    /**
     * Apple OAuth key identifier
     * @default process.env.NUXT_OAUTH_APPLE_KEY_ID
     */
    keyId?: string;
    /**
     * Apple OAuth Private Key. Linebreaks must be replaced with \n
     * @example '-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM...\n-----END PRIVATE KEY-----'
     * @default process.env.NUXT_OAUTH_APPLE_PRIVATE_KEY
     */
    privateKey?: string;
    /**
     * Apple OAuth Scope. Apple wants this to be a string separated by spaces, but for consistency with other providers, we also allow an array of strings.
     * @default ''
     * @see https://developer.apple.com/documentation/sign_in_with_apple/clientconfigi/3230955-scope
     * @example 'name email'
     */
    scope?: string | string[];
    /**
     * Apple OAuth Authorization URL
     * @default 'https://appleid.apple.com/auth/authorize'
     */
    authorizationURL?: string;
    /**
     * Extra authorization parameters to provide to the authorization URL
     * @see https://developer.apple.com/documentation/sign_in_with_apple/clientconfigi/3230955-scope
     * @example { usePop: true }
     */
    authorizationParams?: Record<string, string | boolean>;
    /**
     * Apple OAuth Token URL
     * @default 'https://appleid.apple.com/auth/token'
     */
    tokenURL?: string;
    /**
     * Redirect URL to to allow overriding for situations like prod failing to determine public hostname
     * @default process.env.NUXT_OAUTH_APPLE_REDIRECT_URL or current URL
     */
    redirectURL?: string;
}
export interface OAuthAppleTokens {
    iss: string;
    aud: string;
    exp: number;
    iat: number;
    sub: string;
    at_hash: string;
    email: string;
    email_verified: boolean;
    is_private_email: boolean;
    auth_time: number;
    nonce_supported: boolean;
}
export interface OAuthAppleUser {
    name?: {
        firstName?: string;
        lastName?: string;
    };
    email?: string;
}
export declare function defineOAuthAppleEventHandler({ config, onSuccess, onError, }: OAuthConfig<OAuthAppleConfig, {
    user: OAuthAppleUser;
    payload: OAuthAppleTokens;
    tokens: any;
}>): import("h3").EventHandler<import("h3").EventHandlerRequest, Promise<any>>;
