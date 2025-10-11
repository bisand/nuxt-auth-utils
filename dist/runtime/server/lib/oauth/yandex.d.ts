import type { OAuthConfig } from '#auth-utils';
export interface OAuthYandexConfig {
    /**
     * Yandex OAuth Client ID
     * @default process.env.NUXT_OAUTH_YANDEX_CLIENT_ID
     */
    clientId?: string;
    /**
     * Yandex OAuth Client Secret
     * @default process.env.NUXT_OAUTH_YANDEX_CLIENT_SECRET
     */
    clientSecret?: string;
    /**
     * Yandex OAuth Scope
     * @default []
     * @see https://yandex.ru/dev/id/doc/en/codes/code-url#optional
     * @example ["login:avatar", "login:birthday", "login:email", "login:info", "login:default_phone"]
     */
    scope?: string[];
    /**
     * Require email from user, adds the ['login:email'] scope if not present
     * @default false
     */
    emailRequired?: boolean;
    /**
     * Yandex OAuth Authorization URL
     * @default 'https://oauth.yandex.ru/authorize'
     */
    authorizationURL?: string;
    /**
     * Yandex OAuth Token URL
     * @default 'https://oauth.yandex.ru/token'
     */
    tokenURL?: string;
    /**
     * Yandex OAuth User URL
     * @default 'https://login.yandex.ru/info'
     */
    userURL?: string;
    /**
     * Redirect URL to to allow overriding for situations like prod failing to determine public hostname
     * @default process.env.NUXT_OAUTH_YANDEX_REDIRECT_URL or current URL
     */
    redirectURL?: string;
}
export declare function defineOAuthYandexEventHandler({ config, onSuccess, onError, }: OAuthConfig<OAuthYandexConfig>): import("h3").EventHandler<import("h3").EventHandlerRequest, Promise<any>>;
