import type { OAuthProvider } from '../types/index.js';
import type { AtprotoProviderClientMetadata } from '../types/atproto.js';
export declare const atprotoProviders: "bluesky"[];
export declare const atprotoProviderDefaultClientMetadata: AtprotoProviderClientMetadata;
export declare function getClientMetadataFilename(provider: OAuthProvider, config?: AtprotoProviderClientMetadata): string;
