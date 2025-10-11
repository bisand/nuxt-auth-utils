import type { OAuthConfig } from '#auth-utils';
export interface OAuthGiteaConfig {
    /**
     * Gitea OAuth Client ID
     * @default process.env.NUXT_OAUTH_GITEA_CLIENT_ID
     */
    clientId?: string;
    /**
     * Gitea OAuth Client Secret
     * @default process.env.NUXT_OAUTH_GITEA_CLIENT_SECRET
     */
    clientSecret?: string;
    /**
     * Gitea OAuth Scope
     * @default ['read:user']
     * @see https://docs.gitea.io/en-us/oauth2-provider/
     * @example ['read:user']
     */
    scope?: string[];
    /**
     * Require email from user, adds the ['email'] scope if not present
     * @default false
     */
    emailRequired?: boolean;
    /**
     * Gitea OAuth Authorization URL
     * @default '/login/oauth/authorize'
     */
    authorizationURL?: string;
    /**
     * Gitea OAuth Token URL
     * @default '/login/oauth/access_token'
     */
    tokenURL?: string;
    /**
     * Extra authorization parameters to provide to the authorization URL
     * @see https://docs.gitea.io/en-us/oauth2-provider/
     */
    authorizationParams?: Record<string, string>;
    /**
     * Redirect URL to to allow overriding for situations like prod failing to determine public hostname
     * @default process.env.NUXT_OAUTH_GITEA_REDIRECT_URL
     */
    redirectURL?: string;
    /**
     * URL of your Gitea instance
     * @default 'https://gitea.com'
     */
    baseURL?: string;
}
export declare function defineOAuthGiteaEventHandler({ config, onSuccess, onError, }: OAuthConfig<OAuthGiteaConfig>): import("h3").EventHandler<import("h3").EventHandlerRequest, Promise<any>>;
