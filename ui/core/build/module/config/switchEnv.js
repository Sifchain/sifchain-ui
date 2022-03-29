// Designed to be run in the browser
import queryString from "query-string";
import { AppCookies } from "./AppCookies";
import { isNetworkEnvSymbol } from "./getEnv";
export function switchEnv({
  location = window.location,
  cookies = AppCookies(),
}) {
  const parsed = queryString.parse(location.search);
  const env = parsed["_env"];
  if (typeof env === "undefined" || env === null || Array.isArray(env)) {
    return;
  }
  if (isNetworkEnvSymbol(env)) {
    cookies.setEnv(env);
    location.href = "/";
  }
  if (env === "_") {
    cookies.clearEnv();
    location.href = "/";
  }
}
//# sourceMappingURL=switchEnv.js.map
