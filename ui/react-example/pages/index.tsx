import { useEffect } from "react";
import JSONTree from "react-json-tree";
import { useSifchain } from "ui-core/lib/react";

export default function Home() {
  const [json, api] = useSifchain();

  useEffect(() => {
    Promise.all([api.connectToEthWallet(), api.connectToSifWallet()]);
  }, [api]);

  console.log("Re-rendering eth.isConnected:" + json?.wallet.eth.isConnected);
  console.log("Re-rendering sif.isConnected:" + json?.wallet.sif.isConnected);

  return (
    <>
      {!json?.wallet.sif.isConnected && (
        <button onClick={() => api.connectToSifWallet()}>
          Connect to Sifchain
        </button>
      )}
      {!json?.wallet.eth.isConnected && (
        <button onClick={() => api.connectToEthWallet()}>
          Connect to Metamask
        </button>
      )}
      <code>
        <JSONTree data={json} />
      </code>
    </>
  );
}
