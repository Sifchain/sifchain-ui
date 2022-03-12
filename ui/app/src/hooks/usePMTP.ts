import { useAsyncData } from "./useAsyncData";

async function delay<T>(timeout: number, response: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(response as T);
    }, timeout);
  });
}

function getPMTP() {
  return delay(1000, {
    currentModifier: 0.1982,
  });
}

export default function usePTMP() {
  return useAsyncData(getPMTP);
}
