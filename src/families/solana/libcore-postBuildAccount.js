// @flow
import type { Account } from "../../types";
import type { CoreAccount } from "../../libcore/types";
import type { SolanaResources, CoreSolanaLikeAccount } from "./types";
import { BigNumber } from "bignumber.js";
import { log } from "@ledgerhq/logs";
import {
  libcoreAmountToBigNumber,
  libcoreBigIntToBigNumber,
} from "../../libcore/buildBigNumber";
import { promiseAllBatched } from "../../promise";
import { getMaxEstimatedBalance } from "./logic";

const getValidatorStatus = async (
  solanaAccount: CoreSolanaLikeAccount,
  address
) => {
  const status = ["unbonded", "unbonding", "bonded"];
  const validatorInfo = await solanaAccount.getValidatorInfo(address);
  const rawStatus = await validatorInfo.getActiveStatus();
  // Pre stargate
  if (["0", "1", "2"].includes(rawStatus)) {
    return status[parseInt(rawStatus)];
  }
  // Stargate
  const stargateStatusMap = {
    BOND_STATUS_UNBONDED: "unbonded",
    BOND_STATUS_UNBONDING: "unbonding",
    BOND_STATUS_BONDED: "bonded",
  };
  return stargateStatusMap[rawStatus] || "unbonded";
};

const getFlattenDelegation = async (solanaAccount) => {
  const delegations = await solanaAccount.getDelegations();
  const pendingRewards = await solanaAccount.getPendingRewards();

  return await promiseAllBatched(10, delegations, async (delegation) => {
    const validatorAddress = await delegation.getValidatorAddress();

    let reward;
    for (let i = 0; i < pendingRewards.length; i++) {
      if (
        (await pendingRewards[i].getValidatorAddress()) === validatorAddress
      ) {
        reward = await pendingRewards[i].getRewardAmount();
        break;
      }
    }

    return {
      amount: await libcoreAmountToBigNumber(
        await delegation.getDelegatedAmount()
      ),
      validatorAddress,
      pendingRewards: reward
        ? await libcoreAmountToBigNumber(reward)
        : BigNumber(0),
      status: await getValidatorStatus(solanaAccount, validatorAddress),
    };
  });
};

const getFlattenRedelegations = async (solanaAccount) => {
  const redelegations = await solanaAccount.getRedelegations();

  const toFlatten = await promiseAllBatched(
    3,
    redelegations,
    async (redelegation) =>
      await promiseAllBatched(
        3,
        await redelegation.getEntries(),
        async (entry) => ({
          validatorSrcAddress: await redelegation.getSrcValidatorAddress(),
          validatorDstAddress: await redelegation.getDstValidatorAddress(),
          amount: await libcoreBigIntToBigNumber(
            await entry.getInitialBalance()
          ),
          completionDate: await entry.getCompletionTime(),
        })
      )
  );

  return toFlatten.reduce((old, current) => [...old, ...current], []);
};

const getFlattenUnbonding = async (solanaAccount) => {
  const unbondings = await solanaAccount.getUnbondings();

  const toFlatten = await promiseAllBatched(
    3,
    unbondings,
    async (unbonding) =>
      await promiseAllBatched(
        3,
        await unbonding.getEntries(),
        async (entry) => ({
          validatorAddress: await unbonding.getValidatorAddress(),
          amount: await libcoreBigIntToBigNumber(
            await entry.getInitialBalance()
          ),
          completionDate: await entry.getCompletionTime(),
        })
      )
  );

  return toFlatten.reduce((old, current) => [...old, ...current], []);
};

const filterDelegation = (delegations) => {
  return delegations.filter((delegation) => delegation.amount.gt(0));
};

const getSolanaResources = async (
  account: Account,
  coreAccount
): Promise<SolanaResources> => {
  const solanaAccount = await coreAccount.asSolanaLikeAccount();
  const flattenDelegation = await getFlattenDelegation(solanaAccount);
  const flattenUnbonding = await getFlattenUnbonding(solanaAccount);
  const flattenRedelegation = await getFlattenRedelegations(solanaAccount);
  const res = {
    delegations: filterDelegation(flattenDelegation),
    redelegations: flattenRedelegation,
    unbondings: flattenUnbonding,
    delegatedBalance: flattenDelegation.reduce(
      (old, current) => old.plus(current.amount),
      BigNumber(0)
    ),
    pendingRewardsBalance: flattenDelegation.reduce(
      (old, current) => old.plus(current.pendingRewards),
      BigNumber(0)
    ),
    unbondingBalance: flattenUnbonding.reduce(
      (old, current) => old.plus(current.amount),
      BigNumber(0)
    ),
    withdrawAddress: "",
  };

  return res;
};

const postBuildAccount = async ({
  account,
  coreAccount,
}: {
  account: Account,
  coreAccount: CoreAccount,
}): Promise<Account> => {
  log("solana/post-buildAccount", "getSolanaResources");
  account.solanaResources = await getSolanaResources(account, coreAccount);
  log("solana/post-buildAccount", "getSolanaResources DONE");
  account.spendableBalance = getMaxEstimatedBalance(account, BigNumber(0));
  if (account.spendableBalance.lt(0)) {
    account.spendableBalance = BigNumber(0);
  }
  if (!account.used) {
    const solanaAccount = await coreAccount.asSolanaLikeAccount();
    const seq = await solanaAccount.getSequence();
    account.used = seq != "";
  }
  return account;
};

export default postBuildAccount;
