// @flow
import Prando from "prando";
import { BigNumber } from "bignumber.js";
import type { Account, Operation, OperationType } from "../../types";
import type {
  SolanaResources,
  SolanaDelegation,
  SolanaUnbonding,
  SolanaRedelegation,
} from "./types";

import preloadedData from "./preloadedData.mock";

import { genHex, genAddress } from "../../mock/helpers";

const { validators } = preloadedData;

function setSolanaResources(
  account: Account,
  delegations: SolanaDelegation[],
  unbondingBalance: BigNumber = BigNumber(0),
  unbondings: ?(SolanaUnbonding[]),
  redelegations: ?(SolanaRedelegation[])
): Account {
  /** format solanaResources given the new delegations */
  account.solanaResources = {
    delegations,
    delegatedBalance: delegations.reduce(
      (sum, { amount }) => sum.plus(amount),
      BigNumber(0)
    ),
    pendingRewardsBalance: delegations.reduce(
      (sum, { pendingRewards }) => sum.plus(pendingRewards),
      BigNumber(0)
    ),
    unbondingBalance: account.solanaResources
      ? account.solanaResources.unbondingBalance.plus(unbondingBalance)
      : unbondingBalance,
    withdrawAddress: account.id,
    unbondings: unbondings ?? account.solanaResources?.unbondings ?? [],
    redelegations:
      redelegations ?? account.solanaResources?.redelegations ?? [],
  };

  return account;
}

function setOperationFeeValue(
  operation: Operation,
  base: BigNumber
): Operation {
  operation.fee = BigNumber(Math.round(base.toNumber() * 0.001));

  operation.value = operation.fee;
  return operation;
}

function genBaseOperation(
  account: Account,
  rng: Prando,
  type: OperationType,
  index: number
): Operation {
  const { operations: ops } = account;

  const address = genAddress(account.currency, rng);

  const lastOp = ops[index];
  const date = new Date(
    (lastOp ? lastOp.date.valueOf() : Date.now()) -
      rng.nextInt(0, 100000000 * rng.next() * rng.next())
  );

  const hash = genHex(64, rng);
  /** generate given operation */
  return {
    id: String(`mock_op_${ops.length}_${type}_${account.id}`),
    hash,
    type,
    value: BigNumber(0),
    fee: BigNumber(0),
    senders: [address],
    recipients: [address],
    blockHash: genHex(64, rng),
    blockHeight: account.blockHeight - Math.floor((Date.now() - date) / 900000),
    accountId: account.id,
    date,
    extra: {},
  };
}

/**
 * Generates a solana delegation operation updating both operations list and account solana resources
 * @memberof solana/mock
 * @param {Account} account
 * @param {Prando} rng
 */
function addDelegationOperation(account: Account, rng: Prando): Account {
  const { spendableBalance } = account;

  const solanaResources: SolanaResources = account.solanaResources
    ? account.solanaResources
    : {
        delegations: [],
        delegatedBalance: BigNumber(0),
        pendingRewardsBalance: BigNumber(0),
        unbondingBalance: BigNumber(0),
        withdrawAddress: "",
        unbondings: [],
        redelegations: [],
      };

  if (spendableBalance.isZero()) return account;

  /** select position on the operation stack where we will insert the new delegation */
  const opIndex = rng.next(0, 10);

  const delegationOp = genBaseOperation(account, rng, "DELEGATE", opIndex);
  const feeOp = genBaseOperation(account, rng, "FEES", opIndex);

  const value = spendableBalance.plus(solanaResources.delegatedBalance);

  /** select between 3 to 5 validators and split the amount evenly */
  const delegatedValidators = Array.from({ length: rng.nextInt(3, 5) })
    .map(() => rng.nextArrayItem(validators))
    .filter(
      (validator, index, arr) =>
        arr.findIndex(
          (v) => v.validatorAddress === validator.validatorAddress
        ) === index
    )
    .map(({ validatorAddress }, i, arr) => ({
      address: validatorAddress,
      amount: BigNumber(
        Math.round(value.toNumber() * rng.next(0.1, 1 / arr.length))
      ),
    }));

  delegationOp.extra = { validators: delegatedValidators };

  /** format delegations and randomize rewards and status */
  const delegations: SolanaDelegation[] = delegatedValidators.map(
    ({ address, amount }) => ({
      validatorAddress: address,
      amount,
      pendingRewards: rng.nextBoolean()
        ? BigNumber(Math.round(amount.toNumber() * 0.01))
        : BigNumber(0),
      status: rng.next() > 0.33 ? "bonded" : "unbonded",
    })
  );

  setSolanaResources(account, delegations);

  setOperationFeeValue(
    delegationOp,
    account.solanaResources
      ? account.solanaResources.delegatedBalance
      : BigNumber(0)
  );

  setOperationFeeValue(
    feeOp,
    account.solanaResources
      ? account.solanaResources.delegatedBalance
      : BigNumber(0)
  );

  postSyncAccount(account);
  account.operations.splice(opIndex, 0, delegationOp, feeOp);
  account.operationsCount += 2;

  return account;
}

/**
 * Generates a solana redelegation operation updating both operations list and account solana resources
 * @memberof solana/mock
 * @param {Account} account
 * @param {Prando} rng
 */
function addRedelegationOperation(account: Account, rng: Prando): Account {
  const solanaResources: SolanaResources = account.solanaResources
    ? account.solanaResources
    : {
        delegations: [],
        delegatedBalance: BigNumber(0),
        pendingRewardsBalance: BigNumber(0),
        unbondingBalance: BigNumber(0),
        withdrawAddress: "",
        unbondings: [],
        redelegations: [],
      };

  if (!solanaResources.delegations.length) return account;

  /** select position on the operation stack where we will insert the new delegation */
  const opIndex = rng.next(0, 10);

  const redelegationOp = genBaseOperation(account, rng, "REDELEGATE", opIndex);

  const fromDelegation = rng.nextArrayItem(solanaResources.delegations);

  const amount = BigNumber(
    Math.round(fromDelegation.amount.toNumber() * rng.next(0.1, 1))
  );

  const toDelegation = rng.nextArrayItem(validators);

  redelegationOp.extra = {
    validator: {
      address: toDelegation.validatorAddress,
      amount,
    },
    solanaSourceValidator: fromDelegation.validatorAddress,
  };

  const delegations = solanaResources.delegations
    .filter(
      ({ validatorAddress }) =>
        validatorAddress === fromDelegation.validatorAddress
    )
    .concat([
      {
        validatorAddress: toDelegation.validatorAddress,
        amount,
        pendingRewards: rng.nextBoolean()
          ? BigNumber(Math.round(amount.toNumber() * 0.01))
          : BigNumber(0),
        status: rng.next() > 0.33 ? "bonded" : "unbonded",
      },
    ]);

  setSolanaResources(account, delegations, undefined, undefined, [
    {
      validatorSrcAddress: fromDelegation.validatorAddress,
      validatorDstAddress: toDelegation.validatorAddress,
      amount,
      completionDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    },
  ]);

  setOperationFeeValue(redelegationOp, amount);

  account.operations.splice(opIndex, 0, redelegationOp);
  account.operationsCount++;

  return account;
}

/**
 * Generates a solana redelegation operation updating both operations list and account solana resources
 * @memberof solana/mock
 * @param {Account} account
 * @param {Prando} rng
 */
function addClaimRewardsOperation(account: Account, rng: Prando): Account {
  const solanaResources: SolanaResources = account.solanaResources
    ? account.solanaResources
    : {
        delegations: [],
        delegatedBalance: BigNumber(0),
        pendingRewardsBalance: BigNumber(0),
        unbondingBalance: BigNumber(0),
        withdrawAddress: "",
        unbondings: [],
        redelegations: [],
      };

  if (!solanaResources.delegations.length) return account;

  /** select position on the operation stack where we will insert the new claim rewards */
  const opIndex = rng.next(0, 10);

  const claimRewardOp = genBaseOperation(account, rng, "REWARD", opIndex);

  const fromDelegation = rng.nextArrayItem(solanaResources.delegations);

  const amount = fromDelegation.pendingRewards.gt(0)
    ? fromDelegation.pendingRewards
    : BigNumber(Math.round(fromDelegation.amount.toNumber() * 0.01));

  claimRewardOp.extra = {
    validator: {
      address: fromDelegation.validatorAddress,
      amount,
    },
  };

  const delegations = solanaResources.delegations.map((delegation) => ({
    ...delegation,
    pendingRewards:
      delegation.validatorAddress === fromDelegation.validatorAddress
        ? BigNumber(0)
        : delegation.pendingRewards,
  }));

  setSolanaResources(account, delegations);

  claimRewardOp.fee = BigNumber(Math.round(amount.toNumber() * 0.001));

  claimRewardOp.value = amount;

  account.operations.splice(opIndex, 0, claimRewardOp);
  account.operationsCount++;

  return account;
}

/**
 * Generates a solana undelegation operation updating both operations list and account solana resources
 * @memberof solana/mock
 * @param {Account} account
 * @param {Prando} rng
 */
function addUndelegationOperation(account: Account, rng: Prando): Account {
  const solanaResources: SolanaResources = account.solanaResources
    ? account.solanaResources
    : {
        delegations: [],
        delegatedBalance: BigNumber(0),
        pendingRewardsBalance: BigNumber(0),
        unbondingBalance: BigNumber(0),
        withdrawAddress: "",
        unbondings: [],
        redelegations: [],
      };

  if (!solanaResources.delegations.length) return account;

  /** select position on the operation stack where we will insert the new claim rewards */
  const opIndex = rng.next(0, 10);

  const undelegationOp = genBaseOperation(account, rng, "UNDELEGATE", opIndex);

  const fromDelegation = rng.nextArrayItem(solanaResources.delegations);

  const amount = BigNumber(
    Math.round(
      fromDelegation.amount.toNumber() *
        (rng.nextBoolean() ? rng.next(0.1, 1) : 1)
    )
  );

  const claimedReward = fromDelegation.pendingRewards;

  undelegationOp.extra = {
    validator: {
      address: fromDelegation.validatorAddress,
      amount,
    },
  };

  const delegations = solanaResources.delegations
    .map((delegation) => ({
      ...delegation,
      amount:
        delegation.validatorAddress === fromDelegation.validatorAddress
          ? delegation.amount.minus(amount)
          : delegation.amount,
      pendingRewards: BigNumber(0),
    }))
    .filter(({ amount }) => amount.gt(0));

  setSolanaResources(account, delegations, amount, [
    {
      validatorAddress: fromDelegation.validatorAddress,
      amount,
      completionDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    },
  ]);

  undelegationOp.fee = BigNumber(Math.round(amount.toNumber() * 0.001));

  undelegationOp.value = undelegationOp.fee.minus(claimedReward);

  account.operations.splice(opIndex, 0, undelegationOp);
  account.operationsCount++;

  return account;
}

/**
 * add in specific solana operations
 * @memberof solana/mock
 * @param {Account} account
 * @param {Prando} rng
 */
function genAccountEnhanceOperations(account: Account, rng: Prando): Account {
  addDelegationOperation(account, rng);
  addRedelegationOperation(account, rng);
  addClaimRewardsOperation(account, rng);
  addUndelegationOperation(account, rng);
  addDelegationOperation(account, rng);
  return account;
}

/**
 * Update spendable balance for the account based on delegation data
 * @memberof solana/mock
 * @param {Account} account
 */
function postSyncAccount(account: Account): Account {
  const solanaResources = account.solanaResources || {};
  const delegatedBalance = solanaResources.delegatedBalance || BigNumber(0);
  const unbondingBalance = solanaResources.unbondingBalance || BigNumber(0);

  account.spendableBalance = account.balance
    .minus(delegatedBalance)
    .minus(unbondingBalance);

  return account;
}

/**
 * post account scan data logic
 * clears account solana resources if supposed to be empty
 * @memberof solana/mock
 * @param {Account} account
 */
function postScanAccount(
  account: Account,
  { isEmpty }: { isEmpty: boolean }
): Account {
  if (isEmpty) {
    account.solanaResources = {
      delegations: [],
      delegatedBalance: BigNumber(0),
      pendingRewardsBalance: BigNumber(0),
      unbondingBalance: BigNumber(0),
      withdrawAddress: account.id,
      unbondings: [],
      redelegations: [],
    };
    account.operations = [];
  }

  return account;
}

export default {
  genAccountEnhanceOperations,
  postSyncAccount,
  postScanAccount,
};
