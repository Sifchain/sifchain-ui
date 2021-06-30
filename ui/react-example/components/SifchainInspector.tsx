import JSONTree from "react-json-tree";
import { isAmount } from "@sifchain/sdk";

function replacer(key: string, value: any) {
  // Filtering out properties
  if (isAmount(value)) {
    return value.toString();
  }
  return value;
}

export default function SifchainInspector(p: { data: unknown }) {
  if (!p.data) return null;
  return <JSONTree data={JSON.parse(JSON.stringify(p.data, replacer))} />;
}
