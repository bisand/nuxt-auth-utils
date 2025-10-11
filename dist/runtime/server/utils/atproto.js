import { getRequestURL } from "h3";
import { getOAuthRedirectURL } from "../lib/utils.js";
import { getClientMetadataFilename } from "../../utils/atproto.js";
import { useRuntimeConfig } from "#imports";
export function getAtprotoClientMetadata(event, provider, config) {
  const providerRuntimeConfig = useRuntimeConfig(event).oauth[provider];
  const scopes = [.../* @__PURE__ */ new Set(["atproto", ...config?.scope ?? [], ...providerRuntimeConfig.scope ?? []])];
  const scope = scopes.join(" ");
  const grantTypes = [.../* @__PURE__ */ new Set(["authorization_code", ...providerRuntimeConfig.grantTypes ?? []])];
  const requestURL = getRequestURL(event);
  const baseUrl = `${requestURL.protocol}//${requestURL.host}`;
  const redirectURL = new URL(
    config?.redirectUrl && baseUrl + config.redirectUrl || providerRuntimeConfig.redirectUris[0] && baseUrl + providerRuntimeConfig.redirectUris[0] || getOAuthRedirectURL(event)
  );
  const dev = import.meta.dev;
  if (dev && redirectURL.hostname === "localhost") {
    redirectURL.hostname = "127.0.0.1";
  }
  const redirectUris = (providerRuntimeConfig.redirectUris.length ? providerRuntimeConfig.redirectUris : [requestURL.pathname]).map((uri) => new URL(`${redirectURL.protocol}//${redirectURL.host}${uri}`).toString());
  const clientId = dev ? `http://localhost?redirect_uri=${encodeURIComponent(redirectURL.toString())}&scope=${encodeURIComponent(scope)}` : `${baseUrl}/${getClientMetadataFilename("bluesky", providerRuntimeConfig)}`;
  const clientMetadata = {
    client_name: providerRuntimeConfig.clientName || void 0,
    client_uri: providerRuntimeConfig.clientUri || void 0,
    logo_uri: providerRuntimeConfig.logoUri || void 0,
    policy_uri: providerRuntimeConfig.policyUri || void 0,
    tos_uri: providerRuntimeConfig.tosUri || void 0,
    client_id: clientId,
    redirect_uris: redirectUris,
    scope,
    grant_types: grantTypes,
    application_type: providerRuntimeConfig.applicationType,
    token_endpoint_auth_method: providerRuntimeConfig.tokenEndpointAuthMethod,
    dpop_bound_access_tokens: true
  };
  return clientMetadata;
}
