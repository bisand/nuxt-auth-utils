import type { OAuthConfig } from '#auth-utils';
export interface OAuthGitLabConfig {
    /**
     * GitLab OAuth Client ID
     * @default process.env.NUXT_OAUTH_GITLAB_CLIENT_ID
     */
    clientId?: string;
    /**
     * GitLab OAuth Client Secret
     * @default process.env.NUXT_OAUTH_GITLAB_CLIENT_SECRET
     */
    clientSecret?: string;
    /**
     * GitLab OAuth Scope
     * @default ['read_user']
     * @see https://docs.gitlab.com/ee/integration/oauth_provider.html#view-all-authorized-applications
     * @example ['read_user']
     */
    scope?: string[];
    /**
     * Require email from user, adds the ['email'] scope if not present
     * @default false
     */
    emailRequired?: boolean;
    /**
     * GitLab OAuth Authorization URL
     * @default 'https://gitlab.com/oauth/authorize'
     */
    authorizationURL?: string;
    /**
     * GitLab OAuth Token URL
     * @default 'https://gitlab.com/oauth/token'
     */
    tokenURL?: string;
    /**
     * Extra authorization parameters to provide to the authorization URL
     * @see https://docs.gitlab.com/ee/integration/oauth_provider.html#view-all-authorized-applications
     * @example { allow_signup: 'true' }
     */
    authorizationParams?: Record<string, string>;
    /**
     * Redirect URL to to allow overriding for situations like prod failing to determine public hostname
     * @default process.env.NUXT_OAUTH_GITLAB_REDIRECT_URL
     */
    redirectURL?: string;
    /**
     * URL of your instance, if you are self-hosting
     * @default https://gitlab.com
     */
    baseURL?: string;
}
export declare function defineOAuthGitLabEventHandler({ config, onSuccess, onError, }: OAuthConfig<OAuthGitLabConfig>): import("h3").EventHandler<import("h3").EventHandlerRequest, Promise<any>>;
