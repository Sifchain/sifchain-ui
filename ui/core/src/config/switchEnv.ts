// Designed to be run in the browser
import queryString from "query-string";
import { AppCookies } from "./AppCookies";
import { isSifEnv } from "./getEnv";

export function switchEnv({
  location = window.location,
  cookies = AppCookies(),
}: {
  location: { search: string; href: string };
  cookies?: Pick<AppCookies, "setEnv">;
}) {
  const parsed = queryString.parse(location.search);

  const env = parsed["_env"];

  if (typeof env === "undefined" || env === null || Array.isArray(env)) {
    return;
  }

  if (isSifEnv(env)) {
    cookies.setEnv(env);
    location.href = "/";
  }
}
