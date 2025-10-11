import type { OAuthConfig } from '#auth-utils';
export interface OAuthVKConfig {
    /**
     * VK OAuth Client ID
     * @default process.env.NUXT_OAUTH_VK_CLIENT_ID
     */
    clientId?: string;
    /**
     * VK OAuth Client Secret
     * @default process.env.NUXT_OAUTH_VK_CLIENT_SECRET
     */
    clientSecret?: string;
    /**
     * VK OAuth Scope
     * @default []
     * @see https://id.vk.com/about/business/go/docs/en/vkid/latest/vk-id/connection/api-integration/api-description#App-access-to-user-data
     * @example ["email", "phone"]
     */
    scope?: string[];
    /**
     * Require email from user, adds the ['login:email'] scope if not present
     * @default false
     */
    emailRequired?: boolean;
    /**
     * VK OAuth Authorization URL
     * @default 'https://id.vk.com/authorize'
     */
    authorizationURL?: string;
    /**
     * VK OAuth Token URL
     * @default 'https://id.vk.com/oauth2/auth'
     */
    tokenURL?: string;
    /**
     * VK OAuth User URL
     * @default 'https://id.vk.com/oauth2/user_info'
     */
    userURL?: string;
    /**
     * Redirect URL to to allow overriding for situations like prod failing to determine public hostname
     * @default process.env.NUXT_OAUTH_VK_REDIRECT_URL or current URL
     */
    redirectURL?: string;
}
export declare function defineOAuthVKEventHandler({ config, onSuccess, onError, }: OAuthConfig<OAuthVKConfig>): import("h3").EventHandler<import("h3").EventHandlerRequest, Promise<any>>;
