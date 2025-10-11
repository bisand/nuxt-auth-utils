export const atprotoProviders = ["bluesky"];
export const atprotoProviderDefaultClientMetadata = {
  clientMetadataFilename: "",
  clientName: "",
  clientUri: void 0,
  logoUri: void 0,
  policyUri: void 0,
  tosUri: void 0,
  scope: ["atproto"],
  grantTypes: ["authorization_code"],
  responseTypes: ["code"],
  applicationType: "web",
  // @ts-expect-error TypeScript is too smart for its own good
  redirectUris: void 0,
  dpopBoundAccessTokens: true,
  tokenEndpointAuthMethod: "none"
};
export function getClientMetadataFilename(provider, config) {
  return config?.clientMetadataFilename || provider + "/client-metadata.json";
}
