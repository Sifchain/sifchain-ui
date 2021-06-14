export type StorageServiceContext = {};

export default function createStorageService(ctx: StorageServiceContext) {
  let storageAllowed = true;
  try {
    window.localStorage.setItem("__siftest", "true");
    window.localStorage.removeItem("__siftest");
  } catch (error) {
    storageAllowed = false;
  }

  if (storageAllowed) {
    return {
      getItem: (key: string) => {
        return window.localStorage.getItem(key);
      },
      setItem: (key: string, value: string) => {
        window.localStorage.setItem(key, value);
      },
    };
  } else {
    let storage = new Map();
    return {
      getItem: (key: string) => {
        return String(storage.get(key));
      },
      setItem: (key: string, value: string) => {
        storage.set(key, value);
      },
    };
  }
}
