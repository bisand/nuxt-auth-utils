import { useSession, createError, isEvent } from "h3";
import { defu } from "defu";
import { createHooks } from "hookable";
import { useRuntimeConfig } from "#imports";
export const sessionHooks = createHooks();
export async function getUserSession(event) {
  const session = await _useSession(event);
  return {
    ...session.data,
    id: session.id
  };
}
export async function setUserSession(event, data, config) {
  const session = await _useSession(event, config);
  await session.update(defu(data, session.data));
  return session.data;
}
export async function replaceUserSession(event, data, config) {
  const session = await _useSession(event, config);
  await session.clear();
  await session.update(data);
  return session.data;
}
export async function clearUserSession(event, config) {
  const session = await _useSession(event, config);
  await sessionHooks.callHookParallel("clear", session.data, event);
  await session.clear();
  return true;
}
export async function requireUserSession(event, opts = {}) {
  const userSession = await getUserSession(event);
  if (!userSession.user) {
    if (isEvent(event)) {
      throw createError({
        statusCode: opts.statusCode || 401,
        message: opts.message || "Unauthorized"
      });
    } else {
      throw new Response(opts.message || "Unauthorized", {
        status: opts.statusCode || 401
      });
    }
  }
  return userSession;
}
let sessionConfig;
function _useSession(event, config = {}) {
  if (!sessionConfig) {
    const runtimeConfig = useRuntimeConfig(isEvent(event) ? event : void 0);
    const envSessionPassword = `${runtimeConfig.nitro?.envPrefix || "NUXT_"}SESSION_PASSWORD`;
    sessionConfig = defu({ password: process.env[envSessionPassword] }, runtimeConfig.session);
    if (!sessionConfig.password) {
      console.error(`[nuxt-auth-utils] ${envSessionPassword} environment variable or runtimeConfig.session.password was not set.`);
    }
  }
  const finalConfig = defu(config, sessionConfig);
  return useSession(event, finalConfig);
}
