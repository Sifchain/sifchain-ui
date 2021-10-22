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
  InlineResponse20043Params,
  InlineResponse20043ParamsFromJSON,
  InlineResponse20043ParamsFromJSONTyped,
  InlineResponse20043ParamsToJSON,
} from "./";

/**
 * QueryClientParamsResponse is the response type for the Query/ClientParams RPC method.
 * @export
 * @interface InlineResponse20043
 */
export interface InlineResponse20043 {
  /**
   *
   * @type {InlineResponse20043Params}
   * @memberof InlineResponse20043
   */
  params?: InlineResponse20043Params;
}

export function InlineResponse20043FromJSON(json: any): InlineResponse20043 {
  return InlineResponse20043FromJSONTyped(json, false);
}

export function InlineResponse20043FromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean,
): InlineResponse20043 {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    params: !exists(json, "params")
      ? undefined
      : InlineResponse20043ParamsFromJSON(json["params"]),
  };
}

export function InlineResponse20043ToJSON(
  value?: InlineResponse20043 | null,
): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    params: InlineResponse20043ParamsToJSON(value.params),
  };
}