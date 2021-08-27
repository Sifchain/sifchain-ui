import { DistributionType } from "../../generated/proto/sifnode/dispensation/v1/types";
import { IAsset } from "../../entities";

import { SifUnSignedClient } from "../utils/SifClient";

export type IDispensationServiceContext = {
  nativeAsset: IAsset;
  sifApiUrl: string;
  sifRpcUrl: string;
  sifWsUrl: string;
  sifChainId: string;
  sifUnsignedClient?: SifUnSignedClient;
};

type IDispensationService = {
  claim: (params: { claimType: DistributionType; fromAddress: string }) => any;
};

export default function createDispensationService({
  sifApiUrl,
  nativeAsset,
  sifChainId,
  sifWsUrl,
  sifRpcUrl,
  sifUnsignedClient = new SifUnSignedClient(sifApiUrl, sifWsUrl, sifRpcUrl),
}: IDispensationServiceContext): IDispensationService {
  const client = sifUnsignedClient;
  const instance: IDispensationService = {
    async claim(params) {
      return await client.claim({
        base_req: { chain_id: sifChainId, from: params.fromAddress },
        claim_type: params.claimType,
        signer: params.fromAddress,
      });
    },
  };

  return instance;
}
