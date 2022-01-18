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
 * params holds all the parameters of this module.
 * @export
 * @interface InlineResponse20033Params
 */
export interface InlineResponse20033Params {
  /**
   * unbonding_time is the time duration of unbonding.
   * @type {string}
   * @memberof InlineResponse20033Params
   */
  unbondingTime?: string;
  /**
   * max_validators is the maximum number of validators.
   * @type {number}
   * @memberof InlineResponse20033Params
   */
  maxValidators?: number;
  /**
   * max_entries is the max entries for either unbonding delegation or redelegation (per pair/trio).
   * @type {number}
   * @memberof InlineResponse20033Params
   */
  maxEntries?: number;
  /**
   * historical_entries is the number of historical entries to persist.
   * @type {number}
   * @memberof InlineResponse20033Params
   */
  historicalEntries?: number;
  /**
   * bond_denom defines the bondable coin denomination.
   * @type {string}
   * @memberof InlineResponse20033Params
   */
  bondDenom?: string;
  /**
   *
   * @type {string}
   * @memberof InlineResponse20033Params
   */
  powerReduction?: string;
  /**
   *
   * @type {string}
   * @memberof InlineResponse20033Params
   */
  minCommissionRate?: string;
}

export function InlineResponse20033ParamsFromJSON(
  json: any,
): InlineResponse20033Params {
  return InlineResponse20033ParamsFromJSONTyped(json, false);
}

export function InlineResponse20033ParamsFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean,
): InlineResponse20033Params {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    unbondingTime: !exists(json, "unbonding_time")
      ? undefined
      : json["unbonding_time"],
    maxValidators: !exists(json, "max_validators")
      ? undefined
      : json["max_validators"],
    maxEntries: !exists(json, "max_entries") ? undefined : json["max_entries"],
    historicalEntries: !exists(json, "historical_entries")
      ? undefined
      : json["historical_entries"],
    bondDenom: !exists(json, "bond_denom") ? undefined : json["bond_denom"],
    powerReduction: !exists(json, "power_reduction")
      ? undefined
      : json["power_reduction"],
    minCommissionRate: !exists(json, "min_commission_rate")
      ? undefined
      : json["min_commission_rate"],
  };
}

export function InlineResponse20033ParamsToJSON(
  value?: InlineResponse20033Params | null,
): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    unbonding_time: value.unbondingTime,
    max_validators: value.maxValidators,
    max_entries: value.maxEntries,
    historical_entries: value.historicalEntries,
    bond_denom: value.bondDenom,
    power_reduction: value.powerReduction,
    min_commission_rate: value.minCommissionRate,
  };
}