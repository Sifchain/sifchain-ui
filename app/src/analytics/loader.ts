const createMatomoScript = ({ siteId = "", baseUrl = "", urlSufix = "" }) => `
var _paq = window._paq = window._paq || [];
/* tracker methods like "setCustomDimension" should be called before "trackPageView" */
_paq.push(['trackPageView']);
_paq.push(['enableLinkTracking']);
(function() {
  var u="${baseUrl.replace(/\/$/, "")}";
  _paq.push(['setTrackerUrl', u+'/${urlSufix.replace(/^\//, "")}']);
  _paq.push(['setSiteId', '${siteId}']);
  var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
  g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
})();
`;

type MinimumProviderConfig = {
  analytics: {
    siteId: string;
    baseUrl: string;
    urlSufix: string;
    enabled?: boolean;
  };
};

const ANALYTICS_SCRIPT_ID = "matomo-script";

export default async function loadAnalytics() {
  try {
    console.time("loadAnalytics");
    const providers: MinimumProviderConfig[] = await fetch(
      `https://registry.sifchain.network/api/providers`,
    ).then((x) => x.json());

    const url = window.location.origin;

    const providerConfig = providers.find((x) => x.analytics?.baseUrl === url);

    if (
      providerConfig &&
      providerConfig.analytics.enabled &&
      !document.getElementById(ANALYTICS_SCRIPT_ID)
    ) {
      const scriptSrc = createMatomoScript(providerConfig.analytics);
      const script = document.createElement("script");
      script.id = ANALYTICS_SCRIPT_ID;
      script.innerHTML = scriptSrc;
      document.head.appendChild(script);
    }
    console.timeEnd("loadAnalytics");
  } catch (error) {
    console.warn("failed to load analytics:", error);
  }
}
