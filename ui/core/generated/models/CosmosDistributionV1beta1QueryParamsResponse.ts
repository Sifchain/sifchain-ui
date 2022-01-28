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
  InlineResponse20013Params,
  InlineResponse20013ParamsFromJSON,
  InlineResponse20013ParamsFromJSONTyped,
  InlineResponse20013ParamsToJSON,
} from "./";

/**
 * QueryParamsResponse is the response type for the Query/Params RPC method.
 * @export
 * @interface CosmosDistributionV1beta1QueryParamsResponse
 */
export interface CosmosDistributionV1beta1QueryParamsResponse {
  /**
   *
   * @type {InlineResponse20013Params}
   * @memberof CosmosDistributionV1beta1QueryParamsResponse
   */
  params?: InlineResponse20013Params;
}

export function CosmosDistributionV1beta1QueryParamsResponseFromJSON(
  json: any,
): CosmosDistributionV1beta1QueryParamsResponse {
  return CosmosDistributionV1beta1QueryParamsResponseFromJSONTyped(json, false);
}

export function CosmosDistributionV1beta1QueryParamsResponseFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean,
): CosmosDistributionV1beta1QueryParamsResponse {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    params: !exists(json, "params")
      ? undefined
      : InlineResponse20013ParamsFromJSON(json["params"]),
  };
}

export function CosmosDistributionV1beta1QueryParamsResponseToJSON(
  value?: CosmosDistributionV1beta1QueryParamsResponse | null,
): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    params: InlineResponse20013ParamsToJSON(value.params),
  };
}