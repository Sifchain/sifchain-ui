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
  QueryBlockHeight,
  QueryBlockHeightFromJSON,
  QueryBlockHeightFromJSONTyped,
  QueryBlockHeightToJSON,
} from "./";

/**
 *
 * @export
 * @interface IbcCoreChannelV1QueryUnreceivedAcksResponse
 */
export interface IbcCoreChannelV1QueryUnreceivedAcksResponse {
  /**
   *
   * @type {Array<string>}
   * @memberof IbcCoreChannelV1QueryUnreceivedAcksResponse
   */
  sequences?: Array<string>;
  /**
   *
   * @type {QueryBlockHeight}
   * @memberof IbcCoreChannelV1QueryUnreceivedAcksResponse
   */
  height?: QueryBlockHeight;
}

export function IbcCoreChannelV1QueryUnreceivedAcksResponseFromJSON(
  json: any,
): IbcCoreChannelV1QueryUnreceivedAcksResponse {
  return IbcCoreChannelV1QueryUnreceivedAcksResponseFromJSONTyped(json, false);
}

export function IbcCoreChannelV1QueryUnreceivedAcksResponseFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean,
): IbcCoreChannelV1QueryUnreceivedAcksResponse {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    sequences: !exists(json, "sequences") ? undefined : json["sequences"],
    height: !exists(json, "height")
      ? undefined
      : QueryBlockHeightFromJSON(json["height"]),
  };
}

export function IbcCoreChannelV1QueryUnreceivedAcksResponseToJSON(
  value?: IbcCoreChannelV1QueryUnreceivedAcksResponse | null,
): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    sequences: value.sequences,
    height: QueryBlockHeightToJSON(value.height),
  };
}