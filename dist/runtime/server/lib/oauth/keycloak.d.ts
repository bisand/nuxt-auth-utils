import type { OAuthConfig } from '#auth-utils';
export interface OAuthKeycloakConfig {
    /**
     * Keycloak OAuth Client ID
     * @default process.env.NUXT_OAUTH_KEYCLOAK_CLIENT_ID
     */
    clientId?: string;
    /**
     * Keycloak OAuth Client Secret
     * @default process.env.NUXT_OAUTH_KEYCLOAK_CLIENT_SECRET
     */
    clientSecret?: string;
    /**
     * Keycloak OAuth Server URL
     * @example http://192.168.1.10:8080
     * @default process.env.NUXT_OAUTH_KEYCLOAK_SERVER_URL
     */
    serverUrl?: string;
    /**
     * Optional Keycloak OAuth Server URL to use internally, e.g. if Nuxt connects to a Docker hostname while the browser
     * redirect goes to localhost
     * @example http://keycloak:8080
     * @default process.env.NUXT_OAUTH_KEYCLOAK_SERVER_URL_INTERNAL
     */
    serverUrlInternal?: string;
    /**
     * Keycloak OAuth Realm
     * @default process.env.NUXT_OAUTH_KEYCLOAK_REALM
     */
    realm?: string;
    /**
     * Keycloak OAuth Scope
     * @default []
     * @see https://www.keycloak.org/docs/latest/authorization_services/
     * @example ['openid']
     */
    scope?: string[];
    /**
     * Extra authorization parameters to provide to the authorization URL
     */
    authorizationParams?: Record<string, string>;
    /**
     * Redirect URL to allow overriding for situations like prod failing to determine public hostname
     * @default process.env.NUXT_OAUTH_KEYCLOAK_REDIRECT_URL or current URL
     */
    redirectURL?: string;
}
export declare function defineOAuthKeycloakEventHandler({ config, onSuccess, onError, }: OAuthConfig<OAuthKeycloakConfig>): import("h3").EventHandler<import("h3").EventHandlerRequest, Promise<any>>;
