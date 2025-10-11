import type { OAuthConfig } from '#auth-utils';
export interface OAuthGitHubConfig {
    /**
     * GitHub OAuth Client ID
     * @default process.env.NUXT_OAUTH_GITHUB_CLIENT_ID
     */
    clientId?: string;
    /**
     * GitHub OAuth Client Secret
     * @default process.env.NUXT_OAUTH_GITHUB_CLIENT_SECRET
     */
    clientSecret?: string;
    /**
     * GitHub OAuth Scope
     * @default []
     * @see https://docs.github.com/en/developers/apps/building-oauth-apps/scopes-for-oauth-apps
     * @example ['user:email']
     */
    scope?: string[];
    /**
     * Require email from user, adds the ['user:email'] scope if not present
     * @default false
     */
    emailRequired?: boolean;
    /**
     * GitHub OAuth Authorization URL
     * @default 'https://github.com/login/oauth/authorize'
     */
    authorizationURL?: string;
    /**
     * GitHub OAuth Token URL
     * @default 'https://github.com/login/oauth/access_token'
     */
    tokenURL?: string;
    /**
     * GitHub API URL
     * @default 'https://api.github.com'
     */
    apiURL?: string;
    /**
     * Extra authorization parameters to provide to the authorization URL
     * @see https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#1-request-a-users-github-identity
     * @example { allow_signup: 'true' }
     */
    authorizationParams?: Record<string, string>;
    /**
     * Redirect URL to to allow overriding for situations like prod failing to determine public hostname
     * @default process.env.NUXT_OAUTH_GITHUB_REDIRECT_URL
     * @see https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/differences-between-github-apps-and-oauth-apps
     */
    redirectURL?: string;
}
interface GitHubUser {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    gravatar_id: string;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    site_admin: boolean;
    name: string;
    company: string;
    blog: string;
    location: string;
    email: string | null;
    hireable: boolean | null;
    bio: string | null;
    twitter_username: string | null;
    public_repos: number;
    public_gists: number;
    followers: number;
    following: number;
    created_at: string;
    updated_at: string;
    email_verified?: boolean;
}
interface GitHubTokens {
    access_token: string;
    scope: string;
    token_type: string;
}
export declare function defineOAuthGitHubEventHandler({ config, onSuccess, onError }: OAuthConfig<OAuthGitHubConfig, {
    user: GitHubUser;
    tokens: GitHubTokens;
}>): import("h3").EventHandler<import("h3").EventHandlerRequest, Promise<any>>;
export {};
