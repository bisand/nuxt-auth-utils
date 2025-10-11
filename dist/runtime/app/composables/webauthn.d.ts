import type { WebAuthnComposable } from '#auth-utils';
export declare function useWebAuthn(options?: {
    /**
     * The endpoint to register a new credential.
     * @default '/api/webauthn/register'
     */
    registerEndpoint?: string;
    /**
     * The endpoint to authenticate a user.
     * @default '/api/webauthn/authenticate'
     */
    authenticateEndpoint?: string;
    /**
     * Enable browser autofill for authentication
     * @default false
     */
    useBrowserAutofill?: boolean;
}): WebAuthnComposable;
