// @flow
import invariant from "invariant";
import { useEffect, useMemo, useState } from "react";
import {
  getCurrentSolanaPreloadData,
  getSolanaPreloadDataUpdates,
} from "./preloadedData";
import type {
  SolanaMappedDelegation,
  SolanaValidatorItem,
  SolanaMappedValidator,
  SolanaDelegationInfo,
  SolanaOperationMode,
  SolanaSearchFilter,
  Transaction,
  SolanaExtraTxInfo,
} from "./types";
import {
  mapDelegations,
  mapDelegationInfo,
  searchFilter as defaultSearchFilter,
} from "./logic";
import { getAccountUnit } from "../../account";
import useMemoOnce from "../../hooks/useMemoOnce";
import type { Account } from "../../types";

export function useSolanaPreloadData() {
  const [state, setState] = useState(getCurrentSolanaPreloadData);
  useEffect(() => {
    const sub = getSolanaPreloadDataUpdates().subscribe(setState);
    return () => sub.unsubscribe();
  }, []);
  return state;
}

export function useSolanaMappedDelegations(
  account: Account,
  mode?: SolanaOperationMode
): SolanaMappedDelegation[] {
  const { validators } = useSolanaPreloadData();
  const delegations = account.solanaResources?.delegations;
  invariant(delegations, "solana: delegations is required");

  const unit = getAccountUnit(account);

  return useMemo(() => {
    const mappedDelegations = mapDelegations(delegations, validators, unit);

    return mode === "claimReward"
      ? mappedDelegations.filter(({ pendingRewards }) => pendingRewards.gt(0))
      : mappedDelegations;
  }, [delegations, validators, mode, unit]);
}

export function useSolanaDelegationsQuerySelector(
  account: Account,
  transaction: Transaction,
  delegationSearchFilter?: SolanaSearchFilter = defaultSearchFilter
): {
  query: string,
  setQuery: (query: string) => void,
  options: SolanaMappedDelegation[],
  value: ?SolanaMappedDelegation,
} {
  const [query, setQuery] = useState<string>("");
  const delegations = useSolanaMappedDelegations(account, transaction.mode);

  const options = useMemo<SolanaMappedDelegation[]>(
    () => delegations.filter(delegationSearchFilter(query)),
    [query, delegations, delegationSearchFilter]
  );

  const selectedValidator = transaction.validators && transaction.validators[0];

  const value = useMemo(() => {
    switch (transaction.mode) {
      case "redelegate":
        invariant(
          transaction.solanaSourceValidator,
          "solana: solanaSourceValidator is required"
        );
        return options.find(
          ({ validatorAddress }) =>
            validatorAddress === transaction.solanaSourceValidator
        );
      default:
        return (
          selectedValidator &&
          delegations.find(
            ({ validatorAddress }) =>
              validatorAddress === selectedValidator.address
          )
        );
    }
  }, [delegations, selectedValidator, transaction, options]);

  return {
    query,
    setQuery,
    options,
    value,
  };
}

/** Hook to search and sort SR list according to initial votes and query */
export function useSortedValidators(
  search: string,
  validators: SolanaValidatorItem[],
  delegations: SolanaDelegationInfo[],
  validatorSearchFilter?: SolanaSearchFilter = defaultSearchFilter
): SolanaMappedValidator[] {
  const initialVotes = useMemoOnce(() =>
    delegations.map(({ address }) => address)
  );

  const mappedValidators = useMemo(
    () =>
      validators.map((validator, rank) => ({
        rank: rank + 1,
        validator,
      })),
    [validators]
  );

  const sortedVotes = useMemo(
    () =>
      mappedValidators
        .filter(({ validator }) =>
          initialVotes.includes(validator.validatorAddress)
        )
        .concat(
          mappedValidators.filter(
            ({ validator }) =>
              !initialVotes.includes(validator.validatorAddress)
          )
        ),
    [mappedValidators, initialVotes]
  );

  const sr = useMemo(
    () =>
      search
        ? mappedValidators.filter(validatorSearchFilter(search))
        : sortedVotes,
    [search, mappedValidators, sortedVotes, validatorSearchFilter]
  );

  return sr;
}

export function useMappedExtraOperationDetails({
  account,
  extra,
}: {
  account: Account,
  extra: SolanaExtraTxInfo,
}) {
  const { validators } = useSolanaPreloadData();
  const unit = getAccountUnit(account);

  return {
    validators: extra.validators
      ? mapDelegationInfo(extra.validators, validators, unit)
      : undefined,
    validator: extra.validator
      ? mapDelegationInfo([extra.validator], validators, unit)[0]
      : undefined,
    solanaSourceValidator: extra.solanaSourceValidator
      ? extra.solanaSourceValidator
      : undefined,
  };
}
