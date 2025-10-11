import type { OAuthConfig } from '#auth-utils';
/**
 * WorkOS OAuth Configuration
 * @see https://workos.com/docs/reference/user-management/authentication
 */
export interface OAuthWorkOSConfig {
    /**
     * WorkOS OAuth Client ID *required
     * @default process.env.NUXT_OAUTH_WORKOS_CLIENT_ID
     */
    clientId?: string;
    /**
     * WorkOS OAuth Client Secret (API Key) *required
     * @default process.env.NUXT_OAUTH_WORKOS_CLIENT_SECRET
     */
    clientSecret?: string;
    /**
     * WorkOS OAuth Organization ID *not required
     * @default process.env.NUXT_OAUTH_WORKOS_ORGANIZATION_ID
     */
    organizationId?: string;
    /**
     * WorkOS OAuth Connection ID *not required
     * @default process.env.NUXT_OAUTH_WORKOS_CONNECTION_ID
     */
    connectionId?: string;
    /**
     * WorkOS OAuth screen hint *not required
     * @default 'sign-in'
     */
    screenHint?: 'sign-in' | 'sign-up';
    /**
     * Redirect URL to to allow overriding for situations like prod failing to determine public hostname
     * @default process.env.NUXT_OAUTH_WORKOS_REDIRECT_URL or current URL
     */
    redirectURL?: string;
}
export interface OAuthWorkOSUser {
    object: 'user';
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    email_verified: boolean;
    profile_picture_url: string | null;
    created_at: string;
    updated_at: string;
}
export type OAuthWorkOSAuthenticationMethod = 'SSO' | 'Password' | 'AppleOAuth' | 'GitHubOAuth' | 'GoogleOAuth' | 'MicrosoftOAuth' | 'MagicAuth' | 'Impersonation';
export interface OAuthWorkOSAuthenticateResponse {
    user: OAuthWorkOSUser;
    organization_id: string | null;
    access_token: string;
    refresh_token: string;
    error: string | null;
    error_description: string | null;
    authentication_method: OAuthWorkOSAuthenticationMethod;
}
export interface OAuthWorkOSTokens {
    access_token: string;
    refresh_token: string;
}
export declare function defineOAuthWorkOSEventHandler({ config, onSuccess, onError }: OAuthConfig<OAuthWorkOSConfig, {
    user: OAuthWorkOSUser;
    tokens: OAuthWorkOSTokens;
}>): import("h3").EventHandler<import("h3").EventHandlerRequest, Promise<any>>;
