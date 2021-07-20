import { useCallback } from "react";
import {
  useEthState,
  useSifchain,
  useSifState,
  usePoolState,
  useAssetState,
  useLpPoolsState,
} from "@sifchain/sdk/react";
import SifchainInspector from "../components/SifchainInspector";

export default function Home() {
  const sifchain = useSifchain();

  const connectToSif = useCallback(() => {
    sifchain.connectToSifWallet();
  }, [sifchain]);

  const connectToEth = useCallback(() => {
    sifchain.connectToEthWallet();
  }, [sifchain]);

  const eth = useEthState();
  const sif = useSifState();
  const assets = useAssetState();
  const pools = usePoolState();
  const lpPools = useLpPoolsState();

  console.log("Re-rendering eth.isConnected:" + eth?.isConnected);
  console.log("Re-rendering sif.isConnected:" + sif?.isConnected);
  return (
    <>
      {!sif?.isConnected && (
        <button onClick={connectToSif}>Connect to Sifchain</button>
      )}
      {!eth?.isConnected && (
        <button onClick={connectToEth}>Connect to Metamask</button>
      )}
      <div>
        <b>SIF</b>
        <code>
          <SifchainInspector data={sif} />
        </code>
      </div>
      <div>
        <b>ETH</b>
        <code>
          <SifchainInspector data={eth} />
        </code>
      </div>
      <div>
        <b>Pools</b>
        <code>
          <SifchainInspector data={pools} />
        </code>
      </div>
      <div>
        <b>LpPools</b>
        <code>
          <SifchainInspector data={lpPools} />
        </code>
      </div>
      <div>
        <b>Assets</b>
        <code>
          <SifchainInspector data={assets} />
        </code>
      </div>
    </>
  );
}
