import * as clpTx from "../../generated/proto/sifnode/clp/v1/tx";
import * as dispensationTx from "../../generated/proto/sifnode/dispensation/v1/tx";
import * as ethBridgeTx from "../../generated/proto/sifnode/ethbridge/v1/tx";
import * as tokenRegistryTx from "../../generated/proto/sifnode/tokenregistry/v1/tx";
import { EncodeObjectRecord } from "./types";

export type SifchainEncodeObjectRecord = EncodeObjectRecord<typeof clpTx> &
  EncodeObjectRecord<typeof dispensationTx> &
  EncodeObjectRecord<typeof ethBridgeTx> &
  EncodeObjectRecord<typeof tokenRegistryTx>;

export type SifchainEncodeObject =
  SifchainEncodeObjectRecord[keyof SifchainEncodeObjectRecord];
