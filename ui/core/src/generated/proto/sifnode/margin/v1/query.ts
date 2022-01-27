/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";
import { MTP } from "../../../sifnode/margin/v1/types";

export const protobufPackage = "sifnode.margin.v1";

export interface MTPRequest {
  address: string;
  custodyAsset: string;
  collateralAsset: string;
}

export interface MTPResponse {
  mtp?: MTP;
}

export interface PositionsForAddressRequest {
  address: string;
}

export interface PositionsForAddressResponse {
  mtps: MTP[];
}

const baseMTPRequest: object = {
  address: "",
  custodyAsset: "",
  collateralAsset: "",
};

export const MTPRequest = {
  encode(
    message: MTPRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.address !== "") {
      writer.uint32(10).string(message.address);
    }
    if (message.custodyAsset !== "") {
      writer.uint32(18).string(message.custodyAsset);
    }
    if (message.collateralAsset !== "") {
      writer.uint32(26).string(message.collateralAsset);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MTPRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseMTPRequest } as MTPRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.address = reader.string();
          break;
        case 2:
          message.custodyAsset = reader.string();
          break;
        case 3:
          message.collateralAsset = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MTPRequest {
    const message = { ...baseMTPRequest } as MTPRequest;
    if (object.address !== undefined && object.address !== null) {
      message.address = String(object.address);
    } else {
      message.address = "";
    }
    if (object.custodyAsset !== undefined && object.custodyAsset !== null) {
      message.custodyAsset = String(object.custodyAsset);
    } else {
      message.custodyAsset = "";
    }
    if (
      object.collateralAsset !== undefined &&
      object.collateralAsset !== null
    ) {
      message.collateralAsset = String(object.collateralAsset);
    } else {
      message.collateralAsset = "";
    }
    return message;
  },

  toJSON(message: MTPRequest): unknown {
    const obj: any = {};
    message.address !== undefined && (obj.address = message.address);
    message.custodyAsset !== undefined &&
      (obj.custodyAsset = message.custodyAsset);
    message.collateralAsset !== undefined &&
      (obj.collateralAsset = message.collateralAsset);
    return obj;
  },

  fromPartial(object: DeepPartial<MTPRequest>): MTPRequest {
    const message = { ...baseMTPRequest } as MTPRequest;
    if (object.address !== undefined && object.address !== null) {
      message.address = object.address;
    } else {
      message.address = "";
    }
    if (object.custodyAsset !== undefined && object.custodyAsset !== null) {
      message.custodyAsset = object.custodyAsset;
    } else {
      message.custodyAsset = "";
    }
    if (
      object.collateralAsset !== undefined &&
      object.collateralAsset !== null
    ) {
      message.collateralAsset = object.collateralAsset;
    } else {
      message.collateralAsset = "";
    }
    return message;
  },
};

const baseMTPResponse: object = {};

export const MTPResponse = {
  encode(
    message: MTPResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.mtp !== undefined) {
      MTP.encode(message.mtp, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MTPResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseMTPResponse } as MTPResponse;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.mtp = MTP.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MTPResponse {
    const message = { ...baseMTPResponse } as MTPResponse;
    if (object.mtp !== undefined && object.mtp !== null) {
      message.mtp = MTP.fromJSON(object.mtp);
    } else {
      message.mtp = undefined;
    }
    return message;
  },

  toJSON(message: MTPResponse): unknown {
    const obj: any = {};
    message.mtp !== undefined &&
      (obj.mtp = message.mtp ? MTP.toJSON(message.mtp) : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<MTPResponse>): MTPResponse {
    const message = { ...baseMTPResponse } as MTPResponse;
    if (object.mtp !== undefined && object.mtp !== null) {
      message.mtp = MTP.fromPartial(object.mtp);
    } else {
      message.mtp = undefined;
    }
    return message;
  },
};

const basePositionsForAddressRequest: object = { address: "" };

export const PositionsForAddressRequest = {
  encode(
    message: PositionsForAddressRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.address !== "") {
      writer.uint32(10).string(message.address);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): PositionsForAddressRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...basePositionsForAddressRequest,
    } as PositionsForAddressRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.address = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): PositionsForAddressRequest {
    const message = {
      ...basePositionsForAddressRequest,
    } as PositionsForAddressRequest;
    if (object.address !== undefined && object.address !== null) {
      message.address = String(object.address);
    } else {
      message.address = "";
    }
    return message;
  },

  toJSON(message: PositionsForAddressRequest): unknown {
    const obj: any = {};
    message.address !== undefined && (obj.address = message.address);
    return obj;
  },

  fromPartial(
    object: DeepPartial<PositionsForAddressRequest>,
  ): PositionsForAddressRequest {
    const message = {
      ...basePositionsForAddressRequest,
    } as PositionsForAddressRequest;
    if (object.address !== undefined && object.address !== null) {
      message.address = object.address;
    } else {
      message.address = "";
    }
    return message;
  },
};

const basePositionsForAddressResponse: object = {};

export const PositionsForAddressResponse = {
  encode(
    message: PositionsForAddressResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    for (const v of message.mtps) {
      MTP.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): PositionsForAddressResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...basePositionsForAddressResponse,
    } as PositionsForAddressResponse;
    message.mtps = [];
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.mtps.push(MTP.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): PositionsForAddressResponse {
    const message = {
      ...basePositionsForAddressResponse,
    } as PositionsForAddressResponse;
    message.mtps = [];
    if (object.mtps !== undefined && object.mtps !== null) {
      for (const e of object.mtps) {
        message.mtps.push(MTP.fromJSON(e));
      }
    }
    return message;
  },

  toJSON(message: PositionsForAddressResponse): unknown {
    const obj: any = {};
    if (message.mtps) {
      obj.mtps = message.mtps.map((e) => (e ? MTP.toJSON(e) : undefined));
    } else {
      obj.mtps = [];
    }
    return obj;
  },

  fromPartial(
    object: DeepPartial<PositionsForAddressResponse>,
  ): PositionsForAddressResponse {
    const message = {
      ...basePositionsForAddressResponse,
    } as PositionsForAddressResponse;
    message.mtps = [];
    if (object.mtps !== undefined && object.mtps !== null) {
      for (const e of object.mtps) {
        message.mtps.push(MTP.fromPartial(e));
      }
    }
    return message;
  },
};

export interface Query {
  GetMTP(request: MTPRequest): Promise<MTPResponse>;
  GetPositionsForAddress(
    request: PositionsForAddressRequest,
  ): Promise<PositionsForAddressResponse>;
}

export class QueryClientImpl implements Query {
  private readonly rpc: Rpc;
  constructor(rpc: Rpc) {
    this.rpc = rpc;
    this.GetMTP = this.GetMTP.bind(this);
    this.GetPositionsForAddress = this.GetPositionsForAddress.bind(this);
  }
  GetMTP(request: MTPRequest): Promise<MTPResponse> {
    const data = MTPRequest.encode(request).finish();
    const promise = this.rpc.request("sifnode.margin.v1.Query", "GetMTP", data);
    return promise.then((data) => MTPResponse.decode(new _m0.Reader(data)));
  }

  GetPositionsForAddress(
    request: PositionsForAddressRequest,
  ): Promise<PositionsForAddressResponse> {
    const data = PositionsForAddressRequest.encode(request).finish();
    const promise = this.rpc.request(
      "sifnode.margin.v1.Query",
      "GetPositionsForAddress",
      data,
    );
    return promise.then((data) =>
      PositionsForAddressResponse.decode(new _m0.Reader(data)),
    );
  }
}

interface Rpc {
  request(
    service: string,
    method: string,
    data: Uint8Array,
  ): Promise<Uint8Array>;
}

type Builtin =
  | Date
  | Function
  | Uint8Array
  | string
  | number
  | boolean
  | undefined
  | Long;
export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends {}
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}
