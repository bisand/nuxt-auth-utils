import { defineNuxtPlugin, useUserSession, useError } from "#imports";
export default defineNuxtPlugin(async (nuxtApp) => {
  if (!nuxtApp.payload.serverRendered) {
    await useUserSession().fetch();
  } else if (Boolean(nuxtApp.payload.prerenderedAt) || Boolean(nuxtApp.payload.isCached) || nuxtApp.$config.public.auth.loadStrategy === "client-only") {
    nuxtApp.hook("app:mounted", async () => {
      await useUserSession().fetch();
    });
  }
  if (localStorage.getItem("temp-nuxt-auth-utils-popup")) {
    localStorage.removeItem("temp-nuxt-auth-utils-popup");
    const error = useError();
    if (!error.value) window.close();
  }
});
