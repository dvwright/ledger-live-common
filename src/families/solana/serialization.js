// @flow

import { BigNumber } from "bignumber.js";
import type { SolanaResourcesRaw, SolanaResources } from "./types";

export function toSolanaResourcesRaw(r: SolanaResources): SolanaResourcesRaw {
  const {
    delegatedBalance,
    delegations,
    pendingRewardsBalance,
    unbondingBalance,
    withdrawAddress,
    redelegations,
    unbondings,
  } = r;
  return {
    delegations: delegations.map(
      ({ amount, status, pendingRewards, validatorAddress }) => ({
        amount: amount.toString(),
        status,
        pendingRewards: pendingRewards.toString(),
        validatorAddress,
      })
    ),
    redelegations: redelegations.map(
      ({
        amount,
        completionDate,
        validatorSrcAddress,
        validatorDstAddress,
      }) => ({
        amount: amount.toString(),
        completionDate: completionDate.toString(),
        validatorSrcAddress,
        validatorDstAddress,
      })
    ),
    unbondings: unbondings.map(
      ({ amount, completionDate, validatorAddress }) => ({
        amount: amount.toString(),
        completionDate: completionDate.toString(),
        validatorAddress,
      })
    ),
    delegatedBalance: delegatedBalance.toString(),
    pendingRewardsBalance: pendingRewardsBalance.toString(),
    unbondingBalance: unbondingBalance.toString(),
    withdrawAddress,
  };
}

export function fromSolanaResourcesRaw(r: SolanaResourcesRaw): SolanaResources {
  const {
    delegatedBalance,
    delegations,
    pendingRewardsBalance,
    redelegations,
    unbondingBalance,
    withdrawAddress,
    unbondings,
  } = r;
  return {
    delegations: delegations.map(
      ({ amount, status, pendingRewards, validatorAddress }) => ({
        amount: BigNumber(amount),
        status,
        pendingRewards: BigNumber(pendingRewards),
        validatorAddress,
      })
    ),
    redelegations: redelegations.map(
      ({
        amount,
        completionDate,
        validatorSrcAddress,
        validatorDstAddress,
      }) => ({
        amount: BigNumber(amount),
        completionDate: new Date(completionDate),
        validatorSrcAddress,
        validatorDstAddress,
      })
    ),
    unbondings: unbondings.map(
      ({ amount, completionDate, validatorAddress }) => ({
        amount: BigNumber(amount),
        completionDate: new Date(completionDate),
        validatorAddress,
      })
    ),
    delegatedBalance: BigNumber(delegatedBalance),
    pendingRewardsBalance: BigNumber(pendingRewardsBalance),
    unbondingBalance: BigNumber(unbondingBalance),
    withdrawAddress,
  };
}
