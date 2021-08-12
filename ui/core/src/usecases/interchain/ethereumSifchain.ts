import { UsecaseContext } from "..";
import { IAssetAmount, Chain, Network } from "../../entities";
import { InterchainApi, ChainTransferDraft } from "./types";
import { Peg } from "../peg/peg";
import { SifchainChain, EthereumChain } from "../../services/ChainsService";

export default function EthereumSifchain(context: UsecaseContext) {
  const peg = Peg(context.services, context.store, { ethConfirmations: 50 });

  return (
    ethereumChain: EthereumChain,
    sifchainChain: SifchainChain,
  ): InterchainApi => {
    return {
      async prepareTransfer(assetAmount: IAssetAmount) {
        console.log(
          "prepareTransfer!",
          ethereumChain,
          sifchainChain,
          assetAmount,
        );
        return {
          assetAmount,
          targetAsset: sifchainChain.findAssetWithLikeSymbol(
            assetAmount.asset.symbol,
          ),
          async *execute() {
            try {
              for await (const event of peg(
                assetAmount,
                sifchainChain.network,
              )) {
                yield event;
              }
            } catch (error) {
              console.error(error);
              throw error;
            }
          },
        };
      },
    };
  };
}
