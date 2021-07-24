// Designed to be run in the browser
import queryString from "query-string";
import { AppCookies } from "./AppCookies";
import { isSifEnvSymbol } from "./getEnv";

export function switchEnv({
  location = window.location,
  cookies = AppCookies(),
}: {
  location: { search: string; href: string };
  cookies?: Pick<AppCookies, "setEnv" | "clearEnv">;
}) {
  const parsed = queryString.parse(location.search);

  const env = parsed["_env"];

  if (typeof env === "undefined" || env === null || Array.isArray(env)) {
    return;
  }

  if (isSifEnvSymbol(env)) {
    cookies.setEnv(env);
    location.href = "/";
  }

  if (env === "_") {
    cookies.clearEnv();
    location.href = "/";
  }
}
