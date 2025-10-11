import { type H3Event } from 'h3';
import type { OAuthProvider, OnError } from '#auth-utils';
export declare function getOAuthRedirectURL(event: H3Event): string;
/**
 * Request an access token body.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.3
 */
export interface RequestAccessTokenBody {
    grant_type: 'authorization_code';
    code: string;
    redirect_uri: string;
    client_id: string;
    client_secret?: string;
    [key: string]: string | undefined;
}
export interface RequestAccessTokenOptions {
    body?: RequestAccessTokenBody;
    params?: Record<string, string | undefined>;
    headers?: Record<string, string>;
}
/**
 * Request an access token from the OAuth provider.
 *
 * When an error occurs, only the error data is returned.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.3
 */
export declare function requestAccessToken(url: string, options: RequestAccessTokenOptions): Promise<any>;
/**
 * Handle OAuth access token error response
 *
 * @see https://datatracker.ietf.org/doc/html/rfc6749#section-5.2
 */
export declare function handleAccessTokenErrorResponse(event: H3Event, oauthProvider: OAuthProvider, oauthError: any, onError?: OnError): any;
export declare function handleMissingConfiguration(event: H3Event, provider: OAuthProvider, missingKeys: string[], onError?: OnError): any;
export declare function handleInvalidState(event: H3Event, provider: OAuthProvider, onError?: OnError): any;
/**
 * JWT signing using jose
 *
 * @see https://github.com/panva/jose
 */
interface JWTSignOptions {
    privateKey: string;
    keyId: string;
    teamId?: string;
    clientId?: string;
    algorithm?: 'ES256' | 'RS256';
    expiresIn?: string;
}
export declare function signJwt<T extends Record<string, unknown>>(payload: T, options: JWTSignOptions): Promise<string>;
/**
 * Verify a JWT token using jose - will throw error if invalid
 *
 * @see https://github.com/panva/jose
 */
interface JWTVerifyOptions {
    publicJwkUrl: string;
    audience: string;
    issuer: string;
}
export declare function verifyJwt<T>(token: string, options: JWTVerifyOptions): Promise<T>;
export declare function handlePkceVerifier(event: H3Event): Promise<{
    code_verifier: string;
    code_challenge?: undefined;
    code_challenge_method?: undefined;
} | {
    code_verifier: string;
    code_challenge: string;
    code_challenge_method: string;
}>;
export declare function handleState(event: H3Event): Promise<string>;
export {};
