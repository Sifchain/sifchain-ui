/* tslint:disable */
/* eslint-disable */
/**
 * Sifchain - gRPC Gateway docs
 * A REST interface for state queries, legacy transactions
 *
 * The version of the OpenAPI document: 1.0.0
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from "../runtime";
/**
 * params defines the parameters of the module.
 * @export
 * @interface InlineResponse2001Params
 */
export interface InlineResponse2001Params {
  /**
   *
   * @type {string}
   * @memberof InlineResponse2001Params
   */
  maxMemoCharacters?: string;
  /**
   *
   * @type {string}
   * @memberof InlineResponse2001Params
   */
  txSigLimit?: string;
  /**
   *
   * @type {string}
   * @memberof InlineResponse2001Params
   */
  txSizeCostPerByte?: string;
  /**
   *
   * @type {string}
   * @memberof InlineResponse2001Params
   */
  sigVerifyCostEd25519?: string;
  /**
   *
   * @type {string}
   * @memberof InlineResponse2001Params
   */
  sigVerifyCostSecp256k1?: string;
}

export function InlineResponse2001ParamsFromJSON(
  json: any,
): InlineResponse2001Params {
  return InlineResponse2001ParamsFromJSONTyped(json, false);
}

export function InlineResponse2001ParamsFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean,
): InlineResponse2001Params {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    maxMemoCharacters: !exists(json, "max_memo_characters")
      ? undefined
      : json["max_memo_characters"],
    txSigLimit: !exists(json, "tx_sig_limit")
      ? undefined
      : json["tx_sig_limit"],
    txSizeCostPerByte: !exists(json, "tx_size_cost_per_byte")
      ? undefined
      : json["tx_size_cost_per_byte"],
    sigVerifyCostEd25519: !exists(json, "sig_verify_cost_ed25519")
      ? undefined
      : json["sig_verify_cost_ed25519"],
    sigVerifyCostSecp256k1: !exists(json, "sig_verify_cost_secp256k1")
      ? undefined
      : json["sig_verify_cost_secp256k1"],
  };
}

export function InlineResponse2001ParamsToJSON(
  value?: InlineResponse2001Params | null,
): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    max_memo_characters: value.maxMemoCharacters,
    tx_sig_limit: value.txSigLimit,
    tx_size_cost_per_byte: value.txSizeCostPerByte,
    sig_verify_cost_ed25519: value.sigVerifyCostEd25519,
    sig_verify_cost_secp256k1: value.sigVerifyCostSecp256k1,
  };
}