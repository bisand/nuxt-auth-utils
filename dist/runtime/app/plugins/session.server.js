import { defineNuxtPlugin, useRequestEvent, useUserSession } from "#imports";
export default defineNuxtPlugin({
  name: "session-fetch-plugin",
  enforce: "pre",
  async setup(nuxtApp) {
    nuxtApp.payload.isCached = Boolean(useRequestEvent()?.context.cache);
    if (nuxtApp.payload.serverRendered && !nuxtApp.payload.prerenderedAt && !nuxtApp.payload.isCached && nuxtApp.$config.public.auth.loadStrategy !== "client-only") {
      await useUserSession().fetch();
    }
  }
});
