import * as _nuxt_schema from '@nuxt/schema';
import { ScryptConfig } from '@adonisjs/hash/types';
import { SessionConfig } from 'h3';

interface ModuleOptions {
    /**
     * Enable WebAuthn (Passkeys)
     * @default false
     */
    webAuthn?: boolean;
    /**
     * Enable atproto OAuth (Bluesky, etc.)
     * @default false
     */
    atproto?: boolean;
    /**
     * Hash options used for password hashing
     */
    hash?: {
        /**
         * scrypt options used for password hashing
         */
        scrypt?: ScryptConfig;
    };
    /**
     * Session load strategy
     * @default 'server-first'
     */
    loadStrategy?: 'server-first' | 'client-only';
}
declare module 'nuxt/schema' {
    interface RuntimeConfig {
        hash: {
            scrypt: ScryptConfig;
        };
        /**
         * Session configuration
         */
        session: SessionConfig;
    }
    interface PublicRuntimeConfig {
        auth: {
            loadStrategy: 'server-first' | 'client-only';
        };
    }
}
declare const _default: _nuxt_schema.NuxtModule<ModuleOptions, ModuleOptions, false>;

export { _default as default };
export type { ModuleOptions };
