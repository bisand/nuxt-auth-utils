import type { OAuthConfig } from '#auth-utils';
export interface LiveChatTokens {
    access_token: string;
    account_id: string;
    expires_in: number;
    organization_id: string;
    refresh_token: string;
    scope: string;
    token_type: string;
}
export interface LiveChatUser {
    account_id: string;
    name: string;
    email: string;
    email_verified: boolean;
    default_product: string | null;
    default_organization_id: string | null;
    avatar_url: string | null;
    time_zone: string;
    roles?: {
        role_id: string;
        product: string;
        role: string;
        type: string;
        predefined: boolean;
    }[];
    updated_at: string;
    created_at: string;
    properties?: Record<string, unknown>;
}
export interface LiveChatConfig {
    /**
     * LiveChat OAuth Client ID
     * @default process.env.NUXT_LIVECHAT_CLIENT_ID
     */
    clientId?: string;
    /**
     * LiveChat OAuth Client Secret
     * @default process.env.NUXT_LIVECHAT_CLIENT_SECRET
     */
    clientSecret?: string;
    /**
     * Redirect URL to to allow overriding for situations like prod failing to determine public hostname
     * @default process.env.NUXT_OAUTH_LIVECHAT_REDIRECT_URL or current URL
     */
    redirectURL?: string;
    /**
     * LiveChat OAuth Authorization URL
     * @default 'https://accounts.livechat.com
     */
    authorizationURL?: string;
    /**
     * LiveChat OAuth Token URL
     * @default 'https://accounts.livechat.com/v2/token
     */
    tokenURL?: string;
    /**
     * LiveChat User URL
     * @default 'https://accounts.livechat.com/v2/accounts/me
     */
    userURL?: string;
    /**
     * LiveChat OAuth Scope. If not provided, the default scope from LiveChat will be used.
     * @example ['accounts--my:ro', 'chats--my:ro']
     */
    scope?: string[];
    /**
     * Extra authorization parameters to provide to the authorization URL
     * @see https://platform.text.com/docs/authorization/authorization-in-practice
     */
    authorizationParams?: Record<string, string>;
}
export declare function defineOAuthLiveChatEventHandler({ config, onSuccess, onError, }: OAuthConfig<LiveChatConfig>): import("h3").EventHandler<import("h3").EventHandlerRequest, Promise<any>>;
