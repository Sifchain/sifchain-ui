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
  InlineResponse200Account,
  InlineResponse200AccountFromJSON,
  InlineResponse200AccountFromJSONTyped,
  InlineResponse200AccountToJSON,
} from "./";

/**
 * QueryAccountResponse is the response type for the Query/Account RPC method.
 * @export
 * @interface InlineResponse200
 */
export interface InlineResponse200 {
  /**
   *
   * @type {InlineResponse200Account}
   * @memberof InlineResponse200
   */
  account?: InlineResponse200Account;
}

export function InlineResponse200FromJSON(json: any): InlineResponse200 {
  return InlineResponse200FromJSONTyped(json, false);
}

export function InlineResponse200FromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean,
): InlineResponse200 {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    account: !exists(json, "account")
      ? undefined
      : InlineResponse200AccountFromJSON(json["account"]),
  };
}

export function InlineResponse200ToJSON(value?: InlineResponse200 | null): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    account: InlineResponse200AccountToJSON(value.account),
  };
}