import { IAsset } from "@sifchain/sdk";
import { DistributionType } from "@sifchain/sdk/src/generated/proto/sifnode/dispensation/v1/types";
import { SifUnSignedClient } from "@sifchain/sdk/src/clients/native/SifClient";

export type IDispensationServiceContext = {
  nativeAsset: IAsset;
  sifApiUrl: string;
  sifRpcUrl: string;
  sifChainId: string;
  sifUnsignedClient?: SifUnSignedClient;
};

type IDispensationService = {
  claim: (params: { claimType: DistributionType; fromAddress: string }) => any;
};

export default function createDispensationService({
  sifApiUrl,
  sifChainId,
  sifRpcUrl,
  sifUnsignedClient = new SifUnSignedClient(sifApiUrl, sifRpcUrl),
}: IDispensationServiceContext): IDispensationService {
  const client = sifUnsignedClient;
  const instance: IDispensationService = {
    async claim(params) {
      // return {
      //   typeUrl: `/sifnode.dispensation.v1.MsgCreateUserClaim`,
      //   value: {
      //     userClaimAddress: params?.fromAddress,
      //     userClaimType: params?.claimType,
      //   } as MsgCreateUserClaim,
      // };
      return await client.claim({
        base_req: { chain_id: sifChainId, from: params.fromAddress },
        claim_type: params.claimType,
        claim_creator: params.fromAddress,
      });
    },
  };

  return instance;
}
