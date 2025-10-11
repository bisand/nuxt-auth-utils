import type { EventHandler } from 'h3';
import type { WebAuthnAuthenticateEventHandlerOptions, WebAuthnCredential } from '#auth-utils';
export declare function defineWebAuthnAuthenticateEventHandler<T extends WebAuthnCredential>({ storeChallenge, getChallenge, getCredential, allowCredentials, getOptions, onSuccess, onError, }: WebAuthnAuthenticateEventHandlerOptions<T>): EventHandler;
