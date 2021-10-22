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
import {
  InlineResponse2002Balances,
  InlineResponse2002BalancesFromJSON,
  InlineResponse2002BalancesFromJSONTyped,
  InlineResponse2002BalancesToJSON,
} from "./";

/**
 *
 * @export
 * @interface OsmosisGammV1beta1QueryTotalLiquidityResponse
 */
export interface OsmosisGammV1beta1QueryTotalLiquidityResponse {
  /**
   *
   * @type {Array<InlineResponse2002Balances>}
   * @memberof OsmosisGammV1beta1QueryTotalLiquidityResponse
   */
  liquidity?: Array<InlineResponse2002Balances>;
}

export function OsmosisGammV1beta1QueryTotalLiquidityResponseFromJSON(
  json: any,
): OsmosisGammV1beta1QueryTotalLiquidityResponse {
  return OsmosisGammV1beta1QueryTotalLiquidityResponseFromJSONTyped(
    json,
    false,
  );
}

export function OsmosisGammV1beta1QueryTotalLiquidityResponseFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean,
): OsmosisGammV1beta1QueryTotalLiquidityResponse {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    liquidity: !exists(json, "liquidity")
      ? undefined
      : (json["liquidity"] as Array<any>).map(
          InlineResponse2002BalancesFromJSON,
        ),
  };
}

export function OsmosisGammV1beta1QueryTotalLiquidityResponseToJSON(
  value?: OsmosisGammV1beta1QueryTotalLiquidityResponse | null,
): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    liquidity:
      value.liquidity === undefined
        ? undefined
        : (value.liquidity as Array<any>).map(InlineResponse2002BalancesToJSON),
  };
}