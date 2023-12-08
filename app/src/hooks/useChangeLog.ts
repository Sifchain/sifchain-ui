import { useAsyncDataCached } from "./useAsyncDataCached";

const CHANGES_SERVER_URL = "https://sifchain-changes-server.vercel.app";

const VITE_APP_SHA = String(import.meta.env.VITE_APP_SHA || "master");

export type ChangelogData = {
  version: string;
  changelog: string;
};

async function fetchChangelogData() {
  const tag = /^(\d+).(\d+).(\d+)$/.test(VITE_APP_SHA)
    ? `v${VITE_APP_SHA}`
    : VITE_APP_SHA;

  const data = await fetch(`${CHANGES_SERVER_URL}/api/changes/${tag}`).then(
    (res) => res.json() as Promise<ChangelogData>,
  );

  return {
    version: data.version,
    changelog: data.changelog,
  };
}

export default function useChangeLog() {
  return useAsyncDataCached("changelog", fetchChangelogData);
}
