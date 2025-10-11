import { readFile, writeFile } from 'node:fs/promises';
import { defineNuxtModule, createResolver, addComponentsDir, addImports, addPlugin, addServerPlugin, addServerImportsDir, logger, addServerHandler } from '@nuxt/kit';
import { join } from 'pathe';
import { defu } from 'defu';
import { randomUUID } from 'uncrypto';
import { atprotoProviders, atprotoProviderDefaultClientMetadata, getClientMetadataFilename } from '../dist/runtime/utils/atproto.js';

const module = defineNuxtModule({
  meta: {
    name: "auth-utils",
    configKey: "auth"
  },
  // Default configuration options of the Nuxt module
  defaults: {
    webAuthn: false,
    atproto: false,
    hash: {
      scrypt: {}
    },
    loadStrategy: "server-first"
  },
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url);
    nuxt.options.alias["#auth-utils"] = resolver.resolve(
      "./runtime/types/index"
    );
    const composables = [
      { name: "useUserSession", from: resolver.resolve("./runtime/app/composables/session") }
    ];
    if (options.webAuthn) {
      composables.push({ name: "useWebAuthn", from: resolver.resolve("./runtime/app/composables/webauthn") });
    }
    addComponentsDir({ path: resolver.resolve("./runtime/app/components") });
    addImports(composables);
    addPlugin(resolver.resolve("./runtime/app/plugins/session.server"));
    addPlugin(resolver.resolve("./runtime/app/plugins/session.client"));
    addServerPlugin(resolver.resolve("./runtime/server/plugins/oauth"));
    addServerImportsDir(resolver.resolve("./runtime/server/lib/oauth"));
    if (nuxt.options.nitro?.experimental?.websocket) {
      addServerPlugin(resolver.resolve("./runtime/server/plugins/ws"));
    }
    if (options.webAuthn) {
      const missingDeps = [];
      const peerDeps = ["@simplewebauthn/server", "@simplewebauthn/browser"];
      for (const pkg of peerDeps) {
        await import(pkg).catch(() => {
          missingDeps.push(pkg);
        });
      }
      if (missingDeps.length > 0) {
        logger.withTag("nuxt-auth-utils").error(`Missing dependencies for \`WebAuthn\`, please install with:

\`npx nypm i ${missingDeps.join(" ")}\``);
        process.exit(1);
      }
      addServerImportsDir(resolver.resolve("./runtime/server/lib/webauthn"));
    }
    addServerImportsDir(resolver.resolve("./runtime/server/utils"));
    addServerHandler({
      handler: resolver.resolve("./runtime/server/api/session.delete"),
      route: "/api/_auth/session",
      method: "delete"
    });
    addServerHandler({
      handler: resolver.resolve("./runtime/server/api/session.get"),
      route: "/api/_auth/session",
      method: "get"
    });
    nuxt.options.nitro.unenv ||= {};
    nuxt.options.nitro.unenv.external ||= [];
    if (!nuxt.options.nitro.unenv.external.includes("node:crypto")) {
      nuxt.options.nitro.unenv.external.push("node:crypto");
    }
    const runtimeConfig = nuxt.options.runtimeConfig;
    const envSessionPassword = `${runtimeConfig.nitro?.envPrefix || "NUXT_"}SESSION_PASSWORD`;
    runtimeConfig.session = defu(runtimeConfig.session, {
      name: "nuxt-session",
      password: "",
      cookie: {
        sameSite: "lax"
      }
    });
    runtimeConfig.hash = defu(runtimeConfig.hash, {
      scrypt: options.hash?.scrypt
    });
    if (nuxt.options.dev && !process.env[envSessionPassword]) {
      if (nuxt.options.runtimeConfig.session.password) {
        process.env[envSessionPassword] = nuxt.options.runtimeConfig.session.password;
      } else {
        const password = process.env[envSessionPassword] = randomUUID().replace(/-/g, "");
        const envPath = join(nuxt.options.rootDir, ".env");
        const envContent = await readFile(envPath, "utf-8").catch(() => "");
        if (!envContent.includes(envSessionPassword)) {
          await writeFile(
            envPath,
            `${envContent ? envContent + "\n" : envContent}${envSessionPassword}=${password}`,
            "utf-8"
          );
        }
      }
    }
    runtimeConfig.public.auth = defu(runtimeConfig.public.auth, {
      loadStrategy: options.loadStrategy ?? "server-first"
    });
    runtimeConfig.webauthn = defu(runtimeConfig.webauthn, {
      register: {},
      authenticate: {}
    });
    runtimeConfig.oauth = defu(runtimeConfig.oauth, {});
    runtimeConfig.oauth.gitea = defu(runtimeConfig.oauth.gitea, {
      clientId: "",
      clientSecret: "",
      redirectURL: "",
      baseURL: ""
    });
    runtimeConfig.oauth.github = defu(runtimeConfig.oauth.github, {
      clientId: "",
      clientSecret: "",
      redirectURL: ""
    });
    runtimeConfig.oauth.gitlab = defu(runtimeConfig.oauth.gitlab, {
      clientId: "",
      clientSecret: "",
      redirectURL: "",
      baseURL: "https://gitlab.com"
    });
    runtimeConfig.oauth.spotify = defu(runtimeConfig.oauth.spotify, {
      clientId: "",
      clientSecret: "",
      redirectURL: ""
    });
    runtimeConfig.oauth.google = defu(runtimeConfig.oauth.google, {
      clientId: "",
      clientSecret: "",
      redirectURL: ""
    });
    runtimeConfig.oauth.twitch = defu(runtimeConfig.oauth.twitch, {
      clientId: "",
      clientSecret: "",
      redirectURL: ""
    });
    runtimeConfig.oauth.auth0 = defu(runtimeConfig.oauth.auth0, {
      clientId: "",
      clientSecret: "",
      domain: "",
      audience: "",
      redirectURL: ""
    });
    runtimeConfig.oauth.workos = defu(runtimeConfig.oauth.workos, {
      clientId: "",
      clientSecret: "",
      connectionId: "",
      screenHint: "",
      redirectURL: ""
    });
    runtimeConfig.oauth.microsoft = defu(runtimeConfig.oauth.microsoft, {
      clientId: "",
      clientSecret: "",
      tenant: "",
      scope: [],
      authorizationURL: "",
      tokenURL: "",
      userURL: "",
      redirectURL: ""
    });
    runtimeConfig.oauth.azureb2c = defu(runtimeConfig.oauth.azureb2c, {
      clientId: "",
      policy: "",
      tenant: "",
      scope: [],
      authorizationURL: "",
      tokenURL: "",
      userURL: "",
      redirectURL: ""
    });
    runtimeConfig.oauth.discord = defu(runtimeConfig.oauth.discord, {
      clientId: "",
      clientSecret: "",
      redirectURL: ""
    });
    runtimeConfig.oauth.battledotnet = defu(runtimeConfig.oauth.battledotnet, {
      clientId: "",
      clientSecret: "",
      redirectURL: ""
    });
    for (const provider of atprotoProviders) {
      runtimeConfig.oauth[provider] = defu(runtimeConfig.oauth[provider], atprotoProviderDefaultClientMetadata);
    }
    if (options.atproto) {
      const missingDeps = [];
      const peerDeps = ["@atproto/oauth-client-node", "@atproto/api"];
      for (const pkg of peerDeps) {
        await import(pkg).catch(() => {
          missingDeps.push(pkg);
        });
      }
      if (missingDeps.length > 0) {
        logger.withTag("nuxt-auth-utils").error(`Missing dependencies for \`atproto\`, please install with:

\`npx nypm i ${missingDeps.join(" ")}\``);
        process.exit(1);
      }
      for (const provider of atprotoProviders) {
        addServerHandler({
          handler: resolver.resolve("./runtime/server/routes/atproto/client-metadata.json.get"),
          route: "/" + getClientMetadataFilename(provider, runtimeConfig.oauth[provider]),
          method: "get"
        });
      }
      addServerImportsDir(resolver.resolve("./runtime/server/lib/atproto"));
    }
    runtimeConfig.oauth.keycloak = defu(runtimeConfig.oauth.keycloak, {
      clientId: "",
      clientSecret: "",
      serverUrl: "",
      serverUrlInternal: "",
      realm: "",
      redirectURL: ""
    });
    runtimeConfig.oauth.linear = defu(runtimeConfig.oauth.linear, {
      clientId: "",
      clientSecret: "",
      redirectURL: ""
    });
    runtimeConfig.oauth.linkedin = defu(runtimeConfig.oauth.linkedin, {
      clientId: "",
      clientSecret: "",
      redirectURL: ""
    });
    runtimeConfig.oauth.cognito = defu(runtimeConfig.oauth.cognito, {
      clientId: "",
      clientSecret: "",
      region: "",
      userPoolId: "",
      redirectURL: ""
    });
    runtimeConfig.oauth.facebook = defu(runtimeConfig.oauth.facebook, {
      clientId: "",
      clientSecret: "",
      redirectURL: ""
    });
    runtimeConfig.oauth.instagram = defu(runtimeConfig.oauth.instagram, {
      clientId: "",
      clientSecret: "",
      redirectURL: ""
    });
    runtimeConfig.oauth.paypal = defu(runtimeConfig.oauth.paypal, {
      clientId: "",
      clientSecret: "",
      redirectURL: ""
    });
    runtimeConfig.oauth.steam = defu(runtimeConfig.oauth.steam, {
      apiKey: "",
      redirectURL: ""
    });
    runtimeConfig.oauth.x = defu(runtimeConfig.oauth.x, {
      clientId: "",
      clientSecret: "",
      redirectURL: ""
    });
    runtimeConfig.oauth.xsuaa = defu(runtimeConfig.oauth.xsuaa, {
      clientId: "",
      clientSecret: "",
      domain: "",
      redirectURL: ""
    });
    runtimeConfig.oauth.vk = defu(runtimeConfig.oauth.vk, {
      clientId: "",
      clientSecret: "",
      redirectURL: ""
    });
    runtimeConfig.oauth.yandex = defu(runtimeConfig.oauth.yandex, {
      clientId: "",
      clientSecret: "",
      redirectURL: ""
    });
    runtimeConfig.oauth.tiktok = defu(runtimeConfig.oauth.tiktok, {
      clientKey: "",
      clientSecret: "",
      redirectURL: ""
    });
    runtimeConfig.oauth.dropbox = defu(runtimeConfig.oauth.dropbox, {
      clientId: "",
      clientSecret: "",
      redirectURL: ""
    });
    runtimeConfig.oauth.polar = defu(runtimeConfig.oauth.polar, {
      clientId: "",
      clientSecret: "",
      redirectURL: ""
    });
    runtimeConfig.oauth.zitadel = defu(runtimeConfig.oauth.zitadel, {
      clientId: "",
      clientSecret: "",
      domain: "",
      redirectURL: ""
    });
    runtimeConfig.oauth.authentik = defu(runtimeConfig.oauth.authentik, {
      clientId: "",
      clientSecret: "",
      domain: "",
      redirectURL: ""
    });
    runtimeConfig.oauth.seznam = defu(runtimeConfig.oauth.seznam, {
      clientId: "",
      clientSecret: "",
      redirectURL: ""
    });
    runtimeConfig.oauth.strava = defu(runtimeConfig.oauth.strava, {
      clientId: "",
      clientSecret: "",
      redirectURL: ""
    });
    runtimeConfig.oauth.hubspot = defu(runtimeConfig.oauth.hubspot, {
      clientId: "",
      clientSecret: "",
      redirectURL: ""
    });
    runtimeConfig.oauth.line = defu(runtimeConfig.oauth.line, {
      clientId: "",
      clientSecret: "",
      redirectURL: ""
    });
    runtimeConfig.oauth.atlassian = defu(runtimeConfig.oauth.atlassian, {
      clientId: "",
      clientSecret: "",
      redirectURL: ""
    });
    runtimeConfig.oauth.apple = defu(runtimeConfig.oauth.apple, {
      teamId: "",
      keyId: "",
      privateKey: "",
      redirectURL: "",
      clientId: ""
    });
    runtimeConfig.oauth.kick = defu(runtimeConfig.oauth.kick, {
      clientId: "",
      clientSecret: "",
      redirectURL: ""
    });
    runtimeConfig.oauth.livechat = defu(runtimeConfig.oauth.livechat, {
      clientId: "",
      clientSecret: ""
    });
    runtimeConfig.oauth.salesforce = defu(runtimeConfig.oauth.salesforce, {
      clientId: "",
      clientSecret: "",
      redirectURL: "",
      baseURL: "",
      scope: ""
    });
    runtimeConfig.oauth.slack = defu(runtimeConfig.oauth.slack, {
      clientId: "",
      clientSecret: "",
      redirectURL: "",
      scope: ""
    });
    runtimeConfig.oauth.heroku = defu(runtimeConfig.oauth.heroku, {
      clientId: "",
      clientSecret: "",
      redirectURL: "",
      scope: ""
    });
    runtimeConfig.oauth.roblox = defu(runtimeConfig.oauth.roblox, {
      clientId: "",
      clientSecret: "",
      redirectURL: "",
      scope: ""
    });
    runtimeConfig.oauth.okta = defu(runtimeConfig.oauth.okta, {
      clientId: "",
      clientSecret: "",
      domain: "",
      audience: "",
      scope: [],
      redirectURL: ""
    });
    runtimeConfig.oauth.ory = defu(runtimeConfig.oauth.ory, {
      clientId: "",
      clientSecret: "",
      sdkURL: "",
      redirectURL: "",
      scope: [],
      authorizationURL: "",
      tokenURL: "",
      userURL: ""
    });
  }
});

export { module as default };
