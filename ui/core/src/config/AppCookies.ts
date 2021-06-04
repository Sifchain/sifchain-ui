import Cookies from "js-cookie";
import { SifEnv } from "./getEnv";
export type CookieService = Pick<typeof Cookies, "set" | "get">;

const COOKIE_NAME_SIF_ENV = "__sif_env";

/**
 * DSL for managing app cookies. Eventually any cookies set by the
 * app should be set here using App types.
 * @param service cookie service
 * @returns app cookie manager
 */
export function AppCookies(service: CookieService = Cookies) {
  return {
    getEnv() {
      return service.get(COOKIE_NAME_SIF_ENV);
    },
    setEnv(env: SifEnv) {
      console.log({ env });
      return service.set(COOKIE_NAME_SIF_ENV, env.toString());
    },
  };
}
export type AppCookies = ReturnType<typeof AppCookies>;
