var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as TokenRegistryV1Query from "../../generated/proto/sifnode/tokenregistry/v1/query";
import * as TokenRegistryV1Tx from "../../generated/proto/sifnode/tokenregistry/v1/tx";
import * as CLPV1Query from "../../generated/proto/sifnode/clp/v1/querier";
import * as CLPV1Tx from "../../generated/proto/sifnode/clp/v1/tx";
import * as DispensationV1Query from "../../generated/proto/sifnode/dispensation/v1/query";
import * as DispensationV1Tx from "../../generated/proto/sifnode/dispensation/v1/tx";
import * as EthbridgeV1Query from "../../generated/proto/sifnode/ethbridge/v1/query";
import * as EthbridgeV1Tx from "../../generated/proto/sifnode/ethbridge/v1/tx";
import * as IBCTransferV1Tx from "@cosmjs/stargate/build/codec/ibc/applications/transfer/v1/tx";
import * as CosmosBankV1Tx from "@cosmjs/stargate/build/codec/cosmos/bank/v1beta1/tx";
import * as CosmosStakingV1Tx from "@cosmjs/stargate/build/codec/cosmos/staking/v1beta1/tx";
import * as CosmosStakingV1Query from "@cosmjs/stargate/build/codec/cosmos/staking/v1beta1/query";
import * as CosmosDistributionV1Tx from "@cosmjs/stargate/build/codec/cosmos/distribution/v1beta1/tx";
import * as CosmosDistributionV1Query from "@cosmjs/stargate/build/codec/cosmos/distribution/v1beta1/query";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { buildFeeTable, defaultGasPrice } from "@cosmjs/stargate";
import { Registry } from "@cosmjs/proto-signing/build/registry";
import { isTsProtoGeneratedType, } from "@cosmjs/proto-signing";
import { createProtobufRpcClient, defaultRegistryTypes, QueryClient, setupAuthExtension, setupBankExtension, setupIbcExtension, SigningStargateClient, } from "@cosmjs/stargate";
import { NativeDexTransaction, } from "./NativeDexTransaction";
import { isBroadcastTxFailure, } from "@cosmjs/launchpad";
import { parseTxFailure } from "../../utils/parseTxFailure";
export class NativeDexClient {
    constructor(rpcUrl, restUrl, chainId, t34, query, tx) {
        this.rpcUrl = rpcUrl;
        this.restUrl = restUrl;
        this.chainId = chainId;
        this.t34 = t34;
        this.query = query;
        this.tx = tx;
        this.parseTxResult = NativeDexClient.parseTxResult.bind(NativeDexClient);
    }
    static connect(rpcUrl, restUrl, chainId) {
        return __awaiter(this, void 0, void 0, function* () {
            const t34 = yield Tendermint34Client.connect(rpcUrl);
            const query = this.createQueryClient(t34);
            const tx = this.createTxClient();
            const instance = new this(rpcUrl, restUrl, chainId, t34, query, tx);
            return instance;
        });
    }
    static connectByChain(chain) {
        return __awaiter(this, void 0, void 0, function* () {
            const config = chain.chainConfig;
            return NativeDexClient.connect(config.rpcUrl, config.restUrl, config.chainId);
        });
    }
    /**
     *
     * Composes arguments for type Registry
     * @static
     * @return {*}  {[string, GeneratedType][]}
     * @memberof NativeDexClient
     */
    static getGeneratedTypes() {
        return [
            ...defaultRegistryTypes,
            ...this.createCustomTypesForModule(EthbridgeV1Tx),
            ...this.createCustomTypesForModule(DispensationV1Tx),
            ...this.createCustomTypesForModule(CLPV1Tx),
            ...this.createCustomTypesForModule(TokenRegistryV1Tx),
            ...this.createCustomTypesForModule(CosmosBankV1Tx),
            ...this.createCustomTypesForModule(CosmosDistributionV1Tx),
            ...this.createCustomTypesForModule(CosmosStakingV1Tx),
        ];
    }
    /**
     *
     * Parses `BroadcastTxResult` into DEXv1-compatible output.
     * Will eventually be replaced with custom NativeDex result types
     * @static
     * @param {BroadcastTxResult} result
     * @return {*}  {TransactionStatus}
     * @memberof NativeDexClient
     */
    static parseTxResult(result) {
        try {
            if (isBroadcastTxFailure(result)) {
                /* istanbul ignore next */ // TODO: fix coverage
                return parseTxFailure(result);
            }
            return {
                hash: result.transactionHash,
                memo: "",
                state: "accepted",
            };
        }
        catch (err) {
            const e = err;
            console.log("signAndBroadcast ERROR", e);
            return parseTxFailure({ transactionHash: "", rawLog: e === null || e === void 0 ? void 0 : e.message });
        }
    }
    /**
     *
     * Transforms custom sifnode protobuf modules into types for registry
     */
    static createCustomTypesForModule(nativeModule) {
        let types = [];
        for (const [prop, type] of Object.entries(nativeModule)) {
            if (!isTsProtoGeneratedType(type)) {
                continue;
            }
            types.push([`/${nativeModule.protobufPackage}.${prop}`, type]);
        }
        return types;
    }
    /**
     *
     * Builds registry with custom generated protbuf types
     */
    static getNativeRegistry() {
        return new Registry([...NativeDexClient.getGeneratedTypes()]);
    }
    /**
     * Creates a stargate signing client with custom type registry
     */
    createSigningClient(signer) {
        return __awaiter(this, void 0, void 0, function* () {
            const nativeRegistry = NativeDexClient.getNativeRegistry();
            const client = yield SigningStargateClient.connectWithSigner(this.rpcUrl, signer, {
                // the nativeRegistry technically returns a different version of the type than expected...
                // but it's fine. ignore the type error.
                // @ts-ignore
                registry: nativeRegistry,
            });
            return client;
        });
    }
    /**
     *
     * Creates a type-safe amino-friendly transaction client API
     * @static
     * @return {*}
     * @memberof NativeDexClient
     */
    static createTxClient() {
        // Takes msg client impl & keeps the first argument, then adds a couple more
        /*
        @mccallofthewild -
         Turns protobuf module into a signing client in the same style as stargate query client.
         The design choice of including sender address & gas fees was made in order to facilitate
         data integrity in the confirmation stage, for both UI's and bots.
        */
        const createTxClient = (txModule) => {
            const protoMethods = txModule.MsgClientImpl.prototype;
            // careful with edits here, as the implementation below is @ts-ignore'd
            const createTxCompositionMethod = (methodName) => {
                const typeUrl = `/${txModule.protobufPackage}.Msg${methodName}`;
                const compositionMethod = (msg, senderAddress, { gas, price } = {
                    gas: this.feeTable.transfer.gas,
                    // @mccallofthewild - May want to change this to an `AssetAmount` at some point once the SDK structure is ready
                    price: {
                        denom: this.feeTable.transfer.amount[0].denom,
                        amount: this.feeTable.transfer.amount[0].amount,
                    },
                }, memo = "") => {
                    delete msg["timeoutTimestamp"];
                    return new NativeDexTransaction(senderAddress, [
                        {
                            typeUrl,
                            value: msg,
                        },
                    ], {
                        gas,
                        price,
                    }, memo);
                };
                compositionMethod.createRawEncodeObject = (msg) => ({
                    typeUrl,
                    value: msg,
                });
                return compositionMethod;
            };
            const signingClientMethods = {};
            for (let method of Object.getOwnPropertyNames(protoMethods)) {
                // @ts-ignore
                signingClientMethods[method] = createTxCompositionMethod(method);
            }
            return signingClientMethods;
        };
        const txs = {
            dispensation: createTxClient(DispensationV1Tx),
            ethbridge: createTxClient(EthbridgeV1Tx),
            clp: createTxClient(CLPV1Tx),
            registry: createTxClient(TokenRegistryV1Tx),
            ibc: createTxClient(IBCTransferV1Tx),
            bank: createTxClient(CosmosBankV1Tx),
            staking: createTxClient(CosmosStakingV1Tx),
            distribution: createTxClient(CosmosDistributionV1Tx),
        };
        return txs;
    }
    static createQueryClient(t34) {
        return QueryClient.withExtensions(t34, setupIbcExtension, setupBankExtension, setupAuthExtension, (base) => {
            const rpcClient = createProtobufRpcClient(base);
            return {
                tokenregistry: new TokenRegistryV1Query.QueryClientImpl(rpcClient),
                clp: new CLPV1Query.QueryClientImpl(rpcClient),
                dispensation: new DispensationV1Query.QueryClientImpl(rpcClient),
                ethbridge: new EthbridgeV1Query.QueryClientImpl(rpcClient),
                staking: new CosmosStakingV1Query.QueryClientImpl(rpcClient),
                distribution: new CosmosDistributionV1Query.QueryClientImpl(rpcClient),
            };
        });
    }
}
NativeDexClient.feeTable = buildFeeTable(defaultGasPrice, {
    send: 80000,
    transfer: 250000,
    delegate: 250000,
    undelegate: 250000,
    redelegate: 250000,
    // The gas multiplication per rewards.
    withdrawRewards: 140000,
    govVote: 250000,
}, {});
//# sourceMappingURL=NativeDexClient.js.map