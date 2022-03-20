import DataService from "./DataService";

export * from "./DataService";

export * from "./hooks";

export { default as DataService } from "./DataService";

export default function createDataService(baseUrl?: string) {
  return new DataService(baseUrl);
}
