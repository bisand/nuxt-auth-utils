import type { H3Event, EventHandler } from 'h3';
import type { ValidateUserFunction } from '../../../types/webauthn.js';
import type { WebAuthnUser, WebAuthnRegisterEventHandlerOptions } from '#auth-utils';
export declare function defineWebAuthnRegisterEventHandler<T extends WebAuthnUser>({ storeChallenge, getChallenge, getOptions, validateUser, excludeCredentials, onSuccess, onError, }: WebAuthnRegisterEventHandlerOptions<T>): EventHandler;
export declare function validateUserData<T>(userBody: WebAuthnUser, event: H3Event, fn: ValidateUserFunction<T>): Promise<T>;
