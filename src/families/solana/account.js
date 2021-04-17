// @flow
import invariant from "invariant";
import { BigNumber } from "bignumber.js";
import type { Account, Operation, Unit } from "../../types";
import { getCurrentSolanaPreloadData } from "./preloadedData";
import { getAccountUnit } from "../../account";
import { formatCurrencyUnit } from "../../currencies";
import { mapDelegations, mapUnbondings, mapRedelegations } from "./logic";

function formatOperationSpecifics(op: Operation, unit: ?Unit): string {
  const { validators } = op.extra;
  return (validators || [])
    .map(
      (v) =>
        `\n    to ${v.address} ${
          unit
            ? formatCurrencyUnit(unit, BigNumber(v.amount), {
                showCode: true,
                disableRounding: true,
              }).padEnd(16)
            : v.amount
        }`
    )
    .join("");
}

function formatAccountSpecifics(account: Account): string {
  const { solanaResources } = account;
  invariant(solanaResources, "solana account expected");
  const { validators } = getCurrentSolanaPreloadData();
  const unit = getAccountUnit(account);
  const formatConfig = {
    disableRounding: true,
    alwaysShowSign: false,
    showCode: true,
  };

  let str = " ";

  str +=
    formatCurrencyUnit(unit, account.spendableBalance, formatConfig) +
    " spendable. ";
  if (solanaResources.delegatedBalance.gt(0)) {
    str +=
      formatCurrencyUnit(unit, solanaResources.delegatedBalance, formatConfig) +
      " delegated. ";
  }
  if (solanaResources.unbondingBalance.gt(0)) {
    str +=
      formatCurrencyUnit(unit, solanaResources.unbondingBalance, formatConfig) +
      " unbonding. ";
  }

  const mappedDelegations = mapDelegations(
    solanaResources.delegations,
    validators,
    unit
  );
  if (mappedDelegations.length) {
    str += "\nDELEGATIONS\n";
    str += mappedDelegations
      .map(
        (d) =>
          `  to ${d.validatorAddress} ${formatCurrencyUnit(unit, d.amount, {
            showCode: true,
            disableRounding: true,
          })} ${
            d.pendingRewards.gt(0)
              ? " (claimable " +
                formatCurrencyUnit(unit, d.amount, {
                  disableRounding: true,
                }) +
                ")"
              : ""
          }`
      )
      .join("\n");
  }

  const mappedUnbondings = mapUnbondings(
    solanaResources.unbondings,
    validators,
    unit
  );
  if (mappedUnbondings.length) {
    str += "\nUNDELEGATIONS\n";
    str += mappedUnbondings
      .map(
        (d) =>
          `  from ${d.validatorAddress} ${formatCurrencyUnit(unit, d.amount, {
            showCode: true,
            disableRounding: true,
          })}`
      )
      .join("\n");
  }
  const mappedRedelegations = mapRedelegations(
    solanaResources.redelegations,
    validators,
    unit
  );
  if (mappedRedelegations.length) {
    str += "\nREDELEGATIONS\n";
    str += mappedRedelegations
      .map(
        (d) =>
          `  from ${d.validatorSrcAddress} to ${
            d.validatorDstAddress
          } ${formatCurrencyUnit(unit, d.amount, {
            showCode: true,
            disableRounding: true,
          })}`
      )
      .join("\n");
  }
  return str;
}

export function fromOperationExtraRaw(extra: ?Object) {
  if (extra && extra.validators) {
    return {
      ...extra,
      validators: extra.validators.map((o) => ({
        ...o,
        amount: BigNumber(o.amount),
      })),
    };
  }
  return extra;
}

export function toOperationExtraRaw(extra: ?Object) {
  if (extra && extra.validators) {
    return {
      ...extra,
      validators: extra.validators.map((o) => ({
        ...o,
        amount: o.amount.toString(),
      })),
    };
  }
  return extra;
}

export default {
  formatAccountSpecifics,
  formatOperationSpecifics,
  fromOperationExtraRaw,
  toOperationExtraRaw,
};
