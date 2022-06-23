const createMatomoScript = ({ siteId = "", baseUrl = "", urlSuffix = "" }) => `
var _paq = window._paq = window._paq || [];
/* tracker methods like "setCustomDimension" should be called before "trackPageView" */
_paq.push(['trackPageView']);
_paq.push(['enableLinkTracking']);
(function() {
  var u="${baseUrl.replace(/\/$/, "")}";
  _paq.push(['setTrackerUrl', u+'/${urlSuffix.replace(/^\//, "")}']);
  _paq.push(['setSiteId', '${siteId}']);
  var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
  g.async=true; g.src=u+'/matomo.js'; s.parentNode.insertBefore(g,s);
})();
`;

type MinimumProviderConfig = {
  url: string;
  analytics: {
    siteId: string;
    baseUrl: string;
    urlSuffix: string;
    enabled?: boolean;
  };
};

const ANALYTICS_SCRIPT_ID = "matomo-script";

export default async function loadAnalytics() {
  try {
    const providers: MinimumProviderConfig[] = await fetch(
      `https://registry.sifchain.network/api/providers`,
    ).then((x) => x.json());

    const { origin } = window.location;

    const providerConfig = providers.find((x) => x?.url === origin);

    if (
      providerConfig &&
      (providerConfig.analytics.enabled ?? true) &&
      !document.getElementById(ANALYTICS_SCRIPT_ID)
    ) {
      const scriptSrc = createMatomoScript(providerConfig.analytics);
      const script = document.createElement("script");
      script.id = ANALYTICS_SCRIPT_ID;
      script.innerHTML = scriptSrc;
      document.head.appendChild(script);
      return true;
    }
    return false;
  } catch (error) {
    console.warn("failed to load analytics:", error);
    return false;
  }
}
