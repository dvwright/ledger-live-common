// @flow
import invariant from "invariant";
import { renderHook, act } from "@testing-library/react-hooks";
import { getAccountUnit } from "../../account";
import { getAccountBridge, getCurrencyBridge } from "../../bridge";
import { getCryptoCurrencyById } from "../../currencies";
import { setEnv } from "../../env";
import { makeBridgeCacheSystem } from "../../bridge/cache";
import { genAccount, genAddingOperationsInAccount } from "../../mock/account";
import type { Account, CurrencyBridge } from "../../types";
import type { Transaction } from "./types";
import { getCurrentSolanaPreloadData } from "./preloadedData";
import preloadedMockData from "./preloadedData.mock";
import * as hooks from "./react";

let localCache = {};
const cache = makeBridgeCacheSystem({
  saveData(c, d) {
    localCache[c.id] = d;
    return Promise.resolve();
  },
  getData(c) {
    return Promise.resolve(localCache[c.id]);
  },
});

describe("solana/react", () => {
  describe("useSolanaPreloadData", () => {
    it("should return Solana preload data and updates", async () => {
      const { prepare } = setup();
      const { result } = renderHook(() => hooks.useSolanaPreloadData());

      const data = getCurrentSolanaPreloadData();
      expect(result.current).toStrictEqual(data);

      await act(() => prepare());

      expect(result.current).toStrictEqual(preloadedMockData);
    });
  });

  describe("useSolanaFormattedDelegations", () => {
    it("should return formatted delegations", async () => {
      const { account, prepare } = setup();
      await prepare();

      const { result } = renderHook(() =>
        hooks.useSolanaMappedDelegations(account)
      );

      const delegations = account.solanaResources?.delegations;
      invariant(delegations, "solana: delegations is required");

      expect(Array.isArray(result.current)).toBe(true);
      expect(result.current.length).toBe(delegations.length);

      const { code } = getAccountUnit(account);
      expect(result.current[0].formattedAmount.split(" ")[1]).toBe(code);
      expect(result.current[0].formattedPendingRewards.split(" ")[1]).toBe(
        code
      );
      expect(typeof result.current[0].rank).toBe("number");
      expect(result.current[0].validator.validatorAddress).toBe(
        delegations[0].validatorAddress
      );
    });

    describe("mode: claimReward", () => {
      it("should only return delegations which have some pending rewards", async () => {
        const { account, prepare } = setup();
        await prepare();

        const { result } = renderHook(() =>
          hooks.useSolanaMappedDelegations(account, "claimReward")
        );

        expect(result.current.length).toBe(2);
      });
    });
  });

  describe("useSolanaDelegationsQuerySelector", () => {
    it("should return delegations filtered by query as options", async () => {
      const { account, transaction, prepare } = setup();
      await prepare();

      invariant(
        account.solanaResources,
        "solana: account and solana resources required"
      );
      const delegations = account.solanaResources.delegations || [];
      const newTx = {
        ...transaction,
        mode: "delegate",
        validators: delegations.map(({ validatorAddress, amount }) => ({
          address: validatorAddress,
          amount,
        })),
      };
      const { result } = renderHook(() =>
        hooks.useSolanaDelegationsQuerySelector(account, newTx)
      );

      expect(result.current.options.length).toBe(delegations.length);

      act(() => {
        result.current.setQuery("FRESHATOMS");
      });

      expect(result.current.options.length).toBe(1);
    });

    it("should return the first delegation as value", async () => {
      const { account, transaction, prepare } = setup();
      await prepare();

      invariant(
        account.solanaResources,
        "solana: account and solana resources required"
      );
      const delegations = account.solanaResources.delegations || [];
      const newTx = {
        ...transaction,
        mode: "delegate",
        validators: delegations.map(({ validatorAddress, amount }) => ({
          address: validatorAddress,
          amount,
        })),
      };
      const { result } = renderHook(() =>
        hooks.useSolanaDelegationsQuerySelector(account, newTx)
      );

      expect(result.current.value.validator.validatorAddress).toBe(
        delegations[0].validatorAddress
      );
    });

    it("should find delegation by solanaSourceValidator field and return as value for redelegate", async () => {
      const { account, transaction, prepare } = setup();
      await prepare();

      invariant(
        account.solanaResources,
        "solana: account and solana resources required"
      );
      const delegations = account.solanaResources.delegations || [];
      const solanaSourceValidator =
        delegations[delegations.length - 1].validatorAddress;
      const newTx = {
        ...transaction,
        mode: "redelegate",
        validators: delegations.map(({ validatorAddress, amount }) => ({
          address: validatorAddress,
          amount,
        })),
        solanaSourceValidator,
      };
      const { result } = renderHook(() =>
        hooks.useSolanaDelegationsQuerySelector(account, newTx)
      );

      expect(result.current.value.validator.validatorAddress).toBe(
        solanaSourceValidator
      );
    });
  });

  describe("useSortedValidators", () => {
    it("should reutrn sorted validators", async () => {
      const { account, prepare } = setup();
      await prepare();

      const { result: preloadDataResult } = renderHook(() =>
        hooks.useSolanaPreloadData()
      );

      const { validators } = preloadDataResult.current;
      const delegations = (account.solanaResources?.delegations || []).map(
        ({ validatorAddress, amount }) => ({
          address: validatorAddress,
          amount,
        })
      );
      const { result } = renderHook(() =>
        hooks.useSortedValidators("", validators, delegations)
      );

      expect(result.current.length).toBe(validators.length);

      const { result: searchResult } = renderHook(() =>
        hooks.useSortedValidators("Nodeasy.com", validators, delegations)
      );
      expect(searchResult.current.length).toBe(1);
    });
  });
});

function setup(): {
  account: Account,
  currencyBridge: CurrencyBridge,
  transaction: Transaction,
  prepare: () => Promise<*>,
} {
  setEnv("MOCK", 1);
  setEnv("EXPERIMENTAL_CURRENCIES", "solana");
  const seed = "solana-1";
  const currency = getCryptoCurrencyById("solana");
  const a = genAccount(seed, { currency });
  const account = genAddingOperationsInAccount(a, 3, seed);
  const currencyBridge = getCurrencyBridge(currency);
  const bridge = getAccountBridge(account);
  const transaction = bridge.createTransaction(account);

  return {
    account,
    currencyBridge,
    transaction,
    prepare: async () => cache.prepareCurrency(currency),
  };
}
