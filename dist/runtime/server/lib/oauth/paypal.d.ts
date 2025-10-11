import type { OAuthConfig } from '#auth-utils';
export interface OAuthPaypalConfig {
    /**
     * PayPal Client ID
     * @default process.env.NUXT_OAUTH_PAYPAL_CLIENT_ID
     */
    clientId?: string;
    /**
     * PayPal OAuth Client Secret
     * @default process.env.NUXT_OAUTH_PAYPAL_CLIENT_SECRET
     */
    clientSecret?: string;
    /**
     * PayPal OAuth Scope
     * @default []
     * @see https://developer.paypal.com/docs/log-in-with-paypal/integrate/reference/#scope-attributes
     * @example ['email', 'profile']
     */
    scope?: string[];
    /**
     * Require email from user, adds the ['email'] scope if not present
     * @default false
     */
    emailRequired?: boolean;
    /**
     * Use PayPal sandbox environment
     * @default import.meta.dev // true in development, false in production
     */
    sandbox?: boolean;
    /**
     * PayPal OAuth Authorization URL
     * @default 'https://www.paypal.com/signin/authorize'
     */
    authorizationURL?: string;
    /**
     * PayPal OAuth Token URL
     * @default 'https://api-m.paypal.com/v1/oauth2/token'
     */
    tokenURL?: string;
    /**
     * Extra authorization parameters to provide to the authorization URL
     * @see https://developer.paypal.com/docs/log-in-with-paypal/integrate/build-button/#link-constructauthorizationendpoint
     * @example { flowEntry: 'static' }
     */
    authorizationParams?: Record<string, string>;
    /**
     * Redirect URL to to allow overriding for situations like prod failing to determine public hostname
     * @default process.env.NUXT_OAUTH_PAYPAL_REDIRECT_URL or current URL
     */
    redirectURL?: string;
}
export declare function defineOAuthPaypalEventHandler({ config, onSuccess, onError }: OAuthConfig<OAuthPaypalConfig>): import("h3").EventHandler<import("h3").EventHandlerRequest, Promise<any>>;
