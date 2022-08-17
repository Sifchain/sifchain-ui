/* eslint-disable */
import { Params } from "./params";
import Long from "long";
import { Pool } from "./pool";
import { LiquidityProvider } from "./types";
import _m0 from "protobufjs/minimal";

export const protobufPackage = "sifnode.clp.v1";

/**
 * GenesisState - all clp state that must be provided at genesis
 * TODO: Add parameters to Genesis state ,such as minimum liquidity required to
 * create a pool
 */
export interface GenesisState {
  params?: Params;
  addressWhitelist: string[];
  poolList: Pool[];
  liquidityProviders: LiquidityProvider[];
}

function createBaseGenesisState(): GenesisState {
  return {
    params: undefined,
    addressWhitelist: [],
    poolList: [],
    liquidityProviders: [],
  };
}

export const GenesisState = {
  encode(
    message: GenesisState,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.params !== undefined) {
      Params.encode(message.params, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.addressWhitelist) {
      writer.uint32(18).string(v!);
    }
    for (const v of message.poolList) {
      Pool.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    for (const v of message.liquidityProviders) {
      LiquidityProvider.encode(v!, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GenesisState {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGenesisState();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.params = Params.decode(reader, reader.uint32());
          break;
        case 2:
          message.addressWhitelist.push(reader.string());
          break;
        case 3:
          message.poolList.push(Pool.decode(reader, reader.uint32()));
          break;
        case 4:
          message.liquidityProviders.push(
            LiquidityProvider.decode(reader, reader.uint32()),
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): GenesisState {
    return {
      params: isSet(object.params) ? Params.fromJSON(object.params) : undefined,
      addressWhitelist: Array.isArray(object?.addressWhitelist)
        ? object.addressWhitelist.map((e: any) => String(e))
        : [],
      poolList: Array.isArray(object?.poolList)
        ? object.poolList.map((e: any) => Pool.fromJSON(e))
        : [],
      liquidityProviders: Array.isArray(object?.liquidityProviders)
        ? object.liquidityProviders.map((e: any) =>
            LiquidityProvider.fromJSON(e),
          )
        : [],
    };
  },

  toJSON(message: GenesisState): unknown {
    const obj: any = {};
    message.params !== undefined &&
      (obj.params = message.params ? Params.toJSON(message.params) : undefined);
    if (message.addressWhitelist) {
      obj.addressWhitelist = message.addressWhitelist.map((e) => e);
    } else {
      obj.addressWhitelist = [];
    }
    if (message.poolList) {
      obj.poolList = message.poolList.map((e) =>
        e ? Pool.toJSON(e) : undefined,
      );
    } else {
      obj.poolList = [];
    }
    if (message.liquidityProviders) {
      obj.liquidityProviders = message.liquidityProviders.map((e) =>
        e ? LiquidityProvider.toJSON(e) : undefined,
      );
    } else {
      obj.liquidityProviders = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<GenesisState>, I>>(
    object: I,
  ): GenesisState {
    const message = createBaseGenesisState();
    message.params =
      object.params !== undefined && object.params !== null
        ? Params.fromPartial(object.params)
        : undefined;
    message.addressWhitelist = object.addressWhitelist?.map((e) => e) || [];
    message.poolList = object.poolList?.map((e) => Pool.fromPartial(e)) || [];
    message.liquidityProviders =
      object.liquidityProviders?.map((e) => LiquidityProvider.fromPartial(e)) ||
      [];
    return message;
  },
};

type Builtin =
  | Date
  | Function
  | Uint8Array
  | string
  | number
  | boolean
  | undefined;

export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Long
  ? string | number | Long
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends {}
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin
  ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & {
      [K in Exclude<keyof I, KeysOfUnion<P>>]: never;
    };

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
