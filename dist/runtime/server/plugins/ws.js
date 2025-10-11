import { defineNitroPlugin } from "nitropack/runtime";
import { getUserSession } from "../utils/session.js";
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("request", async (event) => {
    await getUserSession(event);
  });
});
