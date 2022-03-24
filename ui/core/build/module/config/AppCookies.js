import Cookies from "js-cookie";
const COOKIE_NAME_SIF_ENV = "__sif_env";
/**
 * DSL for managing app cookies. Eventually any cookies set by the
 * app should be set here using App types.
 * @param service cookie service
 * @returns app cookie manager
 */
export function AppCookies(service = Cookies) {
    return {
        getEnv() {
            return service.get(COOKIE_NAME_SIF_ENV);
        },
        setEnv(env) {
            service.set(COOKIE_NAME_SIF_ENV, env.toString());
        },
        clearEnv() {
            service.remove(COOKIE_NAME_SIF_ENV);
        },
    };
}
//# sourceMappingURL=AppCookies.js.map