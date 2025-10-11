import { eventHandler } from "h3";
import { clearUserSession } from "../utils/session.js";
export default eventHandler(async (event) => {
  await clearUserSession(event);
  return { loggedOut: true };
});
