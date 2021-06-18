import JSONTree from 'react-json-tree';
import { useSifchain } from "ui-core/lib/react";

export default function Home() {
  const [json, api] = useSifchain();
  return <code><JSONTree data={json} /></code>
}
