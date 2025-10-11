import type { OAuthConfig } from '#auth-utils';
export interface OAuthHerokuConfig {
    /**
     * Heroku OAuth Client ID
     * @default process.env.NUXT_OAUTH_HEROKU_CLIENT_ID
     */
    clientId?: string;
    /**
     * Heroku OAuth Client Secret
     * @default process.env.NUXT_OAUTH_HEROKU_CLIENT_SECRET
     */
    clientSecret?: string;
    /**
     * Heroku OAuth Scope
     * @default ['identity']
     * @see https://devcenter.heroku.com/articles/oauth#scopes
     * @example ['identity']
     */
    scope?: string[];
    /**
     * Heroku OAuth Authorization URL
     * @default 'https://id.heroku.com/oauth/authorize'
     */
    authorizationURL?: string;
    /**
     * Heroku OAuth Authorization URL
     * @default 'https://id.heroku.com/oauth/token'
     */
    tokenURL?: string;
    /**
     * Extra authorization parameters to provide to the authorization URL
     * @default {}
     */
    authorizationParams?: Record<string, string>;
    /**
     * Redirect URL to allow overriding for situations like prod failing to determine public hostname
     * @default process.env.NUXT_OAUTH_HEROKU_REDIRECT_URL or current URL
     */
    redirectURL?: string;
}
export declare function defineOAuthHerokuEventHandler({ config, onSuccess, onError, }: OAuthConfig<OAuthHerokuConfig>): import("h3").EventHandler<import("h3").EventHandlerRequest, Promise<any>>;
