import * as clpTx from "../../generated/sifnode/clp/v1/tx";
import * as dispensationTx from "../../generated/sifnode/dispensation/v1/tx";
import * as ethBridgeTx from "../../generated/sifnode/ethbridge/v1/tx";
import * as tokenRegistryTx from "../../generated/sifnode/tokenregistry/v1/tx";
import { EncodeObjectRecord } from "./types";

export type SifchainEncodeObjectRecord = EncodeObjectRecord<typeof clpTx> &
  EncodeObjectRecord<typeof dispensationTx> &
  EncodeObjectRecord<typeof ethBridgeTx> &
  EncodeObjectRecord<typeof tokenRegistryTx>;
