var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Long from "long";
import { ChainIdHelper } from "../../wallets/cosmos/ChainIdHelper";
export const getTransferTimeoutData = (receivingStargateClient, desiredTimeoutMinutes) => __awaiter(void 0, void 0, void 0, function* () {
    const blockTimeMinutes = 7.25 / 60;
    const timeoutBlockDelta = desiredTimeoutMinutes / blockTimeMinutes;
    return {
        revisionNumber: Long.fromNumber(+ChainIdHelper.parse(yield receivingStargateClient.getChainId()).version.toString() || 0),
        // Set the timeout height as the current height + 150.
        revisionHeight: Long.fromNumber((yield receivingStargateClient.getHeight()) + timeoutBlockDelta),
    };
});
//# sourceMappingURL=getTransferTimeoutData.js.map