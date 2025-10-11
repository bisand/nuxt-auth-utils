import type { OAuthConfig } from '#auth-utils';
export interface OAuthCognitoConfig {
    /**
     * AWS Cognito App Client ID
     * @default process.env.NUXT_OAUTH_COGNITO_CLIENT_ID
     */
    clientId?: string;
    /**
     * AWS Cognito App Client Secret
     * @default process.env.NUXT_OAUTH_COGNITO_CLIENT_SECRET
     */
    clientSecret?: string;
    /**
     * AWS Cognito User Pool ID
     * @default process.env.NUXT_OAUTH_COGNITO_USER_POOL_ID
     */
    userPoolId?: string;
    /**
     * AWS Cognito Region
     * @default process.env.NUXT_OAUTH_COGNITO_REGION
     */
    region?: string;
    /**
     * AWS Cognito Scope
     * @default []
     */
    scope?: string[];
    /**
     * Extra authorization parameters to provide to the authorization URL
     * @see https://docs.aws.amazon.com/cognito/latest/developerguide/authorization-endpoint.html
     */
    authorizationParams?: Record<string, string>;
    /**
     * Redirect URL to to allow overriding for situations like prod failing to determine public hostname
     * @default process.env.NUXT_OAUTH_COGNITO_REDIRECT_URL or current URL
     */
    redirectURL?: string;
}
export declare function defineOAuthCognitoEventHandler({ config, onSuccess, onError }: OAuthConfig<OAuthCognitoConfig>): import("h3").EventHandler<import("h3").EventHandlerRequest, Promise<any>>;
