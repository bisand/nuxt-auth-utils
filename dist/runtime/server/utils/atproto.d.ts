import type { H3Event } from 'h3';
import type { OAuthClientMetadataInput } from '@atproto/oauth-client-node';
import type { OAuthBlueskyConfig } from '../lib/atproto/bluesky.js';
import type { ATProtoProvider, OAuthConfig } from '#auth-utils';
export declare function getAtprotoClientMetadata(event: H3Event, provider: ATProtoProvider, config?: OAuthConfig<OAuthBlueskyConfig>['config']): OAuthClientMetadataInput;
