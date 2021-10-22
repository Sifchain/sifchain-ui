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
 * RedelegationEntry defines a redelegation object with relevant metadata.
 * @export
 * @interface CosmosStakingV1beta1RedelegationEntry
 */
export interface CosmosStakingV1beta1RedelegationEntry {
  /**
   * creation_height  defines the height which the redelegation took place.
   * @type {string}
   * @memberof CosmosStakingV1beta1RedelegationEntry
   */
  creationHeight?: string;
  /**
   * completion_time defines the unix time for redelegation completion.
   * @type {Date}
   * @memberof CosmosStakingV1beta1RedelegationEntry
   */
  completionTime?: Date;
  /**
   * initial_balance defines the initial balance when redelegation started.
   * @type {string}
   * @memberof CosmosStakingV1beta1RedelegationEntry
   */
  initialBalance?: string;
  /**
   * shares_dst is the amount of destination-validator shares created by redelegation.
   * @type {string}
   * @memberof CosmosStakingV1beta1RedelegationEntry
   */
  sharesDst?: string;
}

export function CosmosStakingV1beta1RedelegationEntryFromJSON(
  json: any,
): CosmosStakingV1beta1RedelegationEntry {
  return CosmosStakingV1beta1RedelegationEntryFromJSONTyped(json, false);
}

export function CosmosStakingV1beta1RedelegationEntryFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean,
): CosmosStakingV1beta1RedelegationEntry {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    creationHeight: !exists(json, "creation_height")
      ? undefined
      : json["creation_height"],
    completionTime: !exists(json, "completion_time")
      ? undefined
      : new Date(json["completion_time"]),
    initialBalance: !exists(json, "initial_balance")
      ? undefined
      : json["initial_balance"],
    sharesDst: !exists(json, "shares_dst") ? undefined : json["shares_dst"],
  };
}

export function CosmosStakingV1beta1RedelegationEntryToJSON(
  value?: CosmosStakingV1beta1RedelegationEntry | null,
): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    creation_height: value.creationHeight,
    completion_time:
      value.completionTime === undefined
        ? undefined
        : value.completionTime.toISOString(),
    initial_balance: value.initialBalance,
    shares_dst: value.sharesDst,
  };
}