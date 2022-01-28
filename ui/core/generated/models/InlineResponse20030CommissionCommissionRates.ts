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
 * commission_rates defines the initial commission rates to be used for creating a validator.
 * @export
 * @interface InlineResponse20030CommissionCommissionRates
 */
export interface InlineResponse20030CommissionCommissionRates {
  /**
   * rate is the commission rate charged to delegators, as a fraction.
   * @type {string}
   * @memberof InlineResponse20030CommissionCommissionRates
   */
  rate?: string;
  /**
   * max_rate defines the maximum commission rate which validator can ever charge, as a fraction.
   * @type {string}
   * @memberof InlineResponse20030CommissionCommissionRates
   */
  maxRate?: string;
  /**
   * max_change_rate defines the maximum daily increase of the validator commission, as a fraction.
   * @type {string}
   * @memberof InlineResponse20030CommissionCommissionRates
   */
  maxChangeRate?: string;
}

export function InlineResponse20030CommissionCommissionRatesFromJSON(
  json: any,
): InlineResponse20030CommissionCommissionRates {
  return InlineResponse20030CommissionCommissionRatesFromJSONTyped(json, false);
}

export function InlineResponse20030CommissionCommissionRatesFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean,
): InlineResponse20030CommissionCommissionRates {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    rate: !exists(json, "rate") ? undefined : json["rate"],
    maxRate: !exists(json, "max_rate") ? undefined : json["max_rate"],
    maxChangeRate: !exists(json, "max_change_rate")
      ? undefined
      : json["max_change_rate"],
  };
}

export function InlineResponse20030CommissionCommissionRatesToJSON(
  value?: InlineResponse20030CommissionCommissionRates | null,
): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    rate: value.rate,
    max_rate: value.maxRate,
    max_change_rate: value.maxChangeRate,
  };
}