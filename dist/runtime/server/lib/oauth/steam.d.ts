import type { OAuthConfig } from '#auth-utils';
export interface OAuthSteamConfig {
    /**
     * Steam API Key
     * @default process.env.NUXT_OAUTH_STEAM_API_KEY
     * @see https://steamcommunity.com/dev
     */
    apiKey?: string;
    /**
     * Steam Open ID OAuth Authorization URL
     * @default 'https://steamcommunity.com/openid/login'
     */
    authorizationURL?: string;
    /**
     * Redirect URL to to allow overriding for situations like prod failing to determine public hostname
     * @default process.env.NUXT_OAUTH_STEAM_REDIRECT_URL or current URL
     */
    redirectURL?: string;
}
export declare function defineOAuthSteamEventHandler({ config, onSuccess, onError }: OAuthConfig<OAuthSteamConfig>): import("h3").EventHandler<import("h3").EventHandlerRequest, Promise<any>>;
