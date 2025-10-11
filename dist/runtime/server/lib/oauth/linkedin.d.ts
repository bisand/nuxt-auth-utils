import type { OAuthConfig } from '#auth-utils';
export interface OAuthLinkedInConfig {
    /**
     * LinkedIn OAuth Client ID
     * @default process.env.NUXT_OAUTH_LINKEDIN_CLIENT_ID
     */
    clientId?: string;
    /**
     * LinkedIn OAuth Client Secret
     * @default process.env.NUXT_OAUTH_LINKEDIN_CLIENT_SECRET
     */
    clientSecret?: string;
    /**
     * LinkedIn OAuth Scope
     * @default ['openid', 'profile', 'email']
     * @example ['openid', 'profile']
     */
    scope?: string[];
    /**
     * Require email from user, adds the ['email'] scope if not present
     * @default false
     */
    emailRequired?: boolean;
    /**
     * LinkedIn OAuth Authorization URL
     * @default 'https://www.linkedin.com/oauth/v2/authorization'
     */
    authorizationURL?: string;
    /**
     * LinkedIn OAuth Token URL
     * @default 'https://www.linkedin.com/oauth/v2/accessToken'
     */
    tokenURL?: string;
    /**
     * Extra authorization parameters to provide to the authorization URL
     * @see https://docs.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow?context=linkedin/context
     */
    authorizationParams?: Record<string, string>;
    /**
     * Redirect URL to to allow overriding for situations like prod failing to determine public hostname
     * @default process.env.NUXT_OAUTH_LINKEDIN_REDIRECT_URL or current URL
     */
    redirectURL?: string;
}
export declare function defineOAuthLinkedInEventHandler({ config, onSuccess, onError }: OAuthConfig<OAuthLinkedInConfig>): import("h3").EventHandler<import("h3").EventHandlerRequest, Promise<any>>;
