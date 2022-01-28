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
 * PageResponse is to be embedded in gRPC response messages where the
 * corresponding request message has used PageRequest.
 *
 *  message SomeResponse {
 *          repeated Bar results = 1;
 *          PageResponse page = 2;
 *  }
 * @export
 * @interface CosmosBaseQueryV1beta1PageResponse
 */
export interface CosmosBaseQueryV1beta1PageResponse {
  /**
   *
   * @type {string}
   * @memberof CosmosBaseQueryV1beta1PageResponse
   */
  nextKey?: string;
  /**
   *
   * @type {string}
   * @memberof CosmosBaseQueryV1beta1PageResponse
   */
  total?: string;
}

export function CosmosBaseQueryV1beta1PageResponseFromJSON(
  json: any,
): CosmosBaseQueryV1beta1PageResponse {
  return CosmosBaseQueryV1beta1PageResponseFromJSONTyped(json, false);
}

export function CosmosBaseQueryV1beta1PageResponseFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean,
): CosmosBaseQueryV1beta1PageResponse {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    nextKey: !exists(json, "next_key") ? undefined : json["next_key"],
    total: !exists(json, "total") ? undefined : json["total"],
  };
}

export function CosmosBaseQueryV1beta1PageResponseToJSON(
  value?: CosmosBaseQueryV1beta1PageResponse | null,
): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    next_key: value.nextKey,
    total: value.total,
  };
}