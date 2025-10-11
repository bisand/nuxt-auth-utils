import type { OAuthConfig } from '#auth-utils';
export interface OAuthSlackConfig {
    /**
     * Slack OAuth Client ID
     * @default process.env.NUXT_OAUTH_SLACK_CLIENT_ID
     */
    clientId?: string;
    /**
     * Slack OAuth Client Secret
     * @default process.env.NUXT_OAUTH_SLACK_CLIENT_SECRET
     */
    clientSecret?: string;
    /**
     * Slack OAuth Scope
     * @default ['openid', 'email', 'profile']
     * @see https://api.slack.com/scopes?filter=user
     * @example ['openid']
     */
    scope?: string[];
    /**
     * Slack OAuth Authorization URL
     * @default 'https://slack.com/openid/connect/authorize'
     */
    authorizationURL?: string;
    /**
     * Slack OAuth Authorization URL
     * @default 'https://slack.com/api/openid.connect.token'
     */
    tokenURL?: string;
    /**
     * Extra authorization parameters to provide to the authorization URL
     * @default {}
     */
    authorizationParams?: Record<string, string>;
    /**
     * Redirect URL to allow overriding for situations like prod failing to determine public hostname
     * @default process.env.NUXT_OAUTH_SLACK_REDIRECT_URL or current URL
     */
    redirectURL?: string;
}
export declare function defineOAuthSlackEventHandler({ config, onSuccess, onError, }: OAuthConfig<OAuthSlackConfig>): import("h3").EventHandler<import("h3").EventHandlerRequest, Promise<any>>;
