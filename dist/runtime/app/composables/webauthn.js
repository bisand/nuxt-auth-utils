import {
  browserSupportsWebAuthn,
  browserSupportsWebAuthnAutofill,
  platformAuthenticatorIsAvailable,
  startAuthentication,
  startRegistration
} from "@simplewebauthn/browser";
import { ref, onMounted } from "#imports";
export function useWebAuthn(options = {}) {
  const {
    registerEndpoint = "/api/webauthn/register",
    authenticateEndpoint = "/api/webauthn/authenticate",
    useBrowserAutofill = false
  } = options;
  async function register(user) {
    const { creationOptions, attemptId } = await $fetch(registerEndpoint, {
      method: "POST",
      body: {
        user,
        verify: false
      }
    });
    const attestationResponse = await startRegistration({
      optionsJSON: creationOptions
    });
    const verificationResponse = await $fetch(registerEndpoint, {
      method: "POST",
      body: {
        user,
        attemptId,
        response: attestationResponse,
        verify: true
      }
    });
    return verificationResponse && verificationResponse.verified;
  }
  async function authenticate(userName) {
    const { requestOptions, attemptId } = await $fetch(authenticateEndpoint, {
      method: "POST",
      body: {
        verify: false,
        userName
      }
    });
    const assertionResponse = await startAuthentication({
      optionsJSON: requestOptions,
      useBrowserAutofill
    });
    const verificationResponse = await $fetch(authenticateEndpoint, {
      method: "POST",
      body: {
        attemptId,
        userName,
        response: assertionResponse,
        verify: true
      }
    });
    return verificationResponse && verificationResponse.verified;
  }
  const isSupported = ref(false);
  onMounted(() => {
    isSupported.value = browserSupportsWebAuthn();
  });
  return {
    register,
    authenticate,
    isSupported,
    isAutofillSupported: browserSupportsWebAuthnAutofill,
    isPlatformAvailable: platformAuthenticatorIsAvailable
  };
}
