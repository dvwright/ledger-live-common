// @flow

import { BigNumber } from "bignumber.js";
import type { DatasetTest } from "../../types";
import {
  InvalidAddress,
  InvalidAddressBecauseDestinationIsAlsoSource,
  NotEnoughBalance,
  AmountRequired,
} from "@ledgerhq/errors";
import { ClaimRewardsFeesWarning } from "../../errors";
import invariant from "invariant";
import type { Transaction } from "./types";
import transactionTransformer from "./transaction";

// eslint-disable-next-line no-unused-vars
const solana = {
  FIXME_ignoreAccountFields: [
    "solanaResources.unbondingBalance", // They move once all unbonding are done
    "solanaResources.pendingRewardsBalance", // They are always movings
    "solanaResources.delegations", // They are always movings because of pending Rewards
    "solanaResources.redelegations", // will change ince a redelegation it's done
    "solanaResources.unbondings", // will change once a unbonding it's done
    "spendableBalance", // will change with the rewards that automatically up
  ],
  scanAccounts: [
    {
      name: "solana seed 1",
      apdus: `
          => 550400001b06636f736d6f732c00008076000080000000800000000000000000
          <= 0388459b2653519948b12492f1a0b464720110c147a8155d23d423a5cc3c21d89a636f736d6f73316738343933346a70753376356465357971756b6b6b68786d63767377337532616a787670646c9000
          => 550400001b06636f736d6f732c00008076000080000000800000000000000000
          <= 0388459b2653519948b12492f1a0b464720110c147a8155d23d423a5cc3c21d89a636f736d6f73316738343933346a70753376356465357971756b6b6b68786d63767377337532616a787670646c9000
          => 550400001b06636f736d6f732c00008076000080010000800000000000000000
          <= 02624ac83690d5ef627927104767d679aef73d3d3c9544abe4206b1d0c463c94ff636f736d6f7331303875793571396a743539677775677135797264686b7a6364396a7279736c6d706373746b359000
          => 550400001b06636f736d6f732c00008076000080020000800000000000000000
          <= 038ff98278402aa3e46ccfd020561dc9724ab63d7179ca507c8154b5257c7d5200636f736d6f733163676336393661793270673664346763656a656b3279386c6136366a376535793363376b79779000
          => 550400001b06636f736d6f732c00008076000080030000800000000000000000
          <= 02ecca2a8c647b50bcea2cb4667bb8b2c5f5b2b8439d51c842bc9fd20c4185a95c636f736d6f73313474673476736430713734356678687a6e333239706b78306b727174737a6378797a6c356b759000
      `,
    },
  ],
  accounts: [
    {
      FIXME_tests: ["balance is sum of ops"],
      raw: {
        id:
          "libcore:1:solana:solanapub1addwnpepqwyytxex2dgejj93yjf0rg95v3eqzyxpg75p2hfr6s36tnpuy8vf5p6kez4:",
        seedIdentifier:
          "0388459b2653519948b12492f1a0b464720110c147a8155d23d423a5cc3c21d89a",
        xpub:
          "solanapub1addwnpepqwyytxex2dgejj93yjf0rg95v3eqzyxpg75p2hfr6s36tnpuy8vf5p6kez4",
        derivationMode: "",
        index: 0,
        freshAddress: "solana1g84934jpu3v5de5yqukkkhxmcvsw3u2ajxvpdl",
        freshAddressPath: "44'/118'/0'/0/0",
        freshAddresses: [
          {
            address: "solana1g84934jpu3v5de5yqukkkhxmcvsw3u2ajxvpdl",
            derivationPath: "44'/118'/0'/0/0",
          },
        ],
        name: "Solana 1",
        balance: "2180673",
        spendableBalance: "2180673",
        blockHeight: 1615299,
        currencyId: "solana",
        unit: { name: "Muon", code: "MUON", magnitude: 6 },
        unitMagnitude: 6,
        operationsCount: 85,
        operations: [],
        pendingOperations: [],
        lastSyncDate: "",
      },
      transactions: [
        {
          name: "Same as Recipient",
          transaction: (t) => ({
            ...t,
            amount: BigNumber(100),
            recipient: "solana1g84934jpu3v5de5yqukkkhxmcvsw3u2ajxvpdl",
          }),
          expectedStatus: {
            errors: {
              recipient: new InvalidAddressBecauseDestinationIsAlsoSource(),
            },
            warnings: {},
          },
        },
        {
          name: "Invalid Address",
          transaction: (t) => ({
            ...t,
            amount: BigNumber(100),
            recipient: "dsadasdasdasdas",
          }),
          expectedStatus: {
            errors: {
              recipient: new InvalidAddress(),
            },
            warnings: {},
          },
        },
        {
          name: "send max",
          transaction: transactionTransformer.fromTransactionRaw({
            amount: "0",
            recipient: "solana108uy5q9jt59gwugq5yrdhkzcd9jryslmpcstk5",
            useAllAmount: true,
            family: "solana",
            networkInfo: null,
            validators: [],
            solanaSourceValidator: null,
            fees: null,
            gas: null,
            memo: null,
            mode: "send",
          }),
          expectedStatus: (account) => {
            const { solanaResources } = account;
            invariant(solanaResources, "Should exist because it's solana");
            const totalSpent = account.balance.minus(
              solanaResources.unbondingBalance.plus(
                solanaResources.delegatedBalance
              )
            );
            return {
              errors: {},
              warnings: {},
              totalSpent,
            };
          },
        },
        {
          name: "send with memo",
          transaction: transactionTransformer.fromTransactionRaw({
            amount: "0",
            recipient: "solana108uy5q9jt59gwugq5yrdhkzcd9jryslmpcstk5",
            useAllAmount: true,
            family: "solana",
            networkInfo: null,
            validators: [],
            solanaSourceValidator: null,
            fees: null,
            gas: null,
            memo: "test",
            mode: "send",
          }),
          expectedStatus: (account, t) => {
            const { solanaResources } = account;
            invariant(solanaResources, "Should exist because it's solana");
            invariant(t.memo === "test", "Should have a memo");
            const totalSpent = account.balance.minus(
              solanaResources.unbondingBalance.plus(
                solanaResources.delegatedBalance
              )
            );
            return {
              errors: {},
              warnings: {},
              totalSpent,
            };
          },
        },
        {
          name: "Not Enough balance",
          transaction: (t) => ({
            ...t,
            amount: BigNumber("99999999999999999"),
            recipient: "solana108uy5q9jt59gwugq5yrdhkzcd9jryslmpcstk5",
          }),
          expectedStatus: {
            errors: {
              amount: new NotEnoughBalance(),
            },
            warnings: {},
          },
        },
        {
          name: "Redelegation - success",
          transaction: (t) => ({
            ...t,
            amount: BigNumber(100),
            validators: [
              {
                address: "solanavaloper1grgelyng2v6v3t8z87wu3sxgt9m5s03xfytvz7",
                amount: BigNumber(100),
              },
            ],
            solanaSourceValidator:
              "solanavaloper1sd4tl9aljmmezzudugs7zlaya7pg2895ws8tfs",
            mode: "redelegate",
          }),
          expectedStatus: (a, t) => {
            invariant(t.memo === "Ledger Live", "Should have a memo");
            return {
              errors: {},
              warnings: {},
            };
          },
        },
        {
          name: "redelegation - AmountRequired",
          transaction: (t) => ({
            ...t,
            mode: "redelegate",
            validators: [
              {
                address: "solanavaloper1grgelyng2v6v3t8z87wu3sxgt9m5s03xfytvz7",
                amount: BigNumber(0),
              },
            ],
            solanaSourceValidator:
              "solanavaloper1sd4tl9aljmmezzudugs7zlaya7pg2895ws8tfs",
          }),
          expectedStatus: {
            errors: { amount: new AmountRequired() },
            warnings: {},
          },
        },
        {
          name: "redelegation - Source is Destination",
          transaction: (t) => ({
            ...t,
            mode: "redelegate",
            validators: [
              {
                address: "solanavaloper1sd4tl9aljmmezzudugs7zlaya7pg2895ws8tfs",
                amount: BigNumber(100),
              },
            ],
            solanaSourceValidator:
              "solanavaloper1sd4tl9aljmmezzudugs7zlaya7pg2895ws8tfs",
          }),
          expectedStatus: {
            errors: {
              redelegation: new InvalidAddressBecauseDestinationIsAlsoSource(),
            },
            warnings: {},
          },
        },
        {
          name: "Unbonding - success",
          transaction: (t) => ({
            ...t,
            mode: "undelegate",
            validators: [
              {
                address: "solanavaloper1grgelyng2v6v3t8z87wu3sxgt9m5s03xfytvz7",
                amount: BigNumber(100),
              },
            ],
          }),
          expectedStatus: (a, t) => {
            invariant(t.memo === "Ledger Live", "Should have a memo");
            return {
              errors: {},
              warnings: {},
            };
          },
        },
        {
          name: "Unbonding - AmountRequired",
          transaction: (t) => ({
            ...t,
            mode: "undelegate",
            validators: [
              {
                address: "solanavaloper1grgelyng2v6v3t8z87wu3sxgt9m5s03xfytvz7",
                amount: BigNumber(0),
              },
            ],
          }),
          expectedStatus: {
            errors: { amount: new AmountRequired() },
            warnings: {},
          },
        },
        {
          name: "Delegate - success",
          transaction: (t) => ({
            ...t,
            mode: "delegate",
            validators: [
              {
                address: "solanavaloper1grgelyng2v6v3t8z87wu3sxgt9m5s03xfytvz7",
                amount: BigNumber(100),
              },
            ],
          }),
          expectedStatus: (a, t) => {
            invariant(t.memo === "Ledger Live", "Should have a memo");
            return {
              errors: {},
              warnings: {},
            };
          },
        },
        {
          name: "Delegate - not a valid",
          transaction: (t) => ({
            ...t,
            mode: "delegate",
            validators: [
              {
                address: "solana108uy5q9jt59gwugq5yrdhkzcd9jryslmpcstk5",
                amount: BigNumber(100),
              },
            ],
          }),
          expectedStatus: {
            errors: { recipient: new InvalidAddress() },
            warnings: {},
          },
        },
        {
          name: "ClaimReward - success",
          transaction: (t) => ({
            ...t,
            validators: [
              {
                address: "solanavaloper1grgelyng2v6v3t8z87wu3sxgt9m5s03xfytvz7",
                amount: BigNumber(0),
              },
            ],
            mode: "claimReward",
          }),
          expectedStatus: (a, t) => {
            invariant(t.memo === "Ledger Live", "Should have a memo");
            return {
              errors: {},
              warnings: {},
            };
          },
        },
        {
          name: "ClaimReward - Warning",
          transaction: (t) => ({
            ...t,
            validators: [
              {
                address: "solanavaloper1grgelyng2v6v3t8z87wu3sxgt9m5s03xfytvz7",
                amount: BigNumber(0),
              },
            ],
            fees: BigNumber(9999999999999999),
            mode: "claimReward",
          }),
          expectedStatus: {
            errors: {},
            warnings: { claimReward: new ClaimRewardsFeesWarning() },
          },
        },
        {
          name: "ClaimReward - not a solanavaloper",
          transaction: (t) => ({
            ...t,
            validators: [
              {
                address: "solana108uy5q9jt59gwugq5yrdhkzcd9jryslmpcstk5",
                amount: BigNumber(0),
              },
            ],
            mode: "claimReward",
          }),
          expectedStatus: {
            errors: { recipient: new InvalidAddress() },
            warnings: {},
          },
        },
        {
          name: "claimRewardCompound - success",
          transaction: (t) => ({
            ...t,
            validators: [
              {
                address: "solanavaloper1grgelyng2v6v3t8z87wu3sxgt9m5s03xfytvz7",
                amount: BigNumber(100),
              },
            ],
            mode: "claimRewardCompound",
          }),
          expectedStatus: (a, t) => {
            invariant(t.memo === "Ledger Live", "Should have a memo");
            return {
              errors: {},
              warnings: {},
            };
          },
        },
        {
          name: "ClaimRewardCompound - Warning",
          transaction: (t) => ({
            ...t,
            validators: [
              {
                address: "solanavaloper1grgelyng2v6v3t8z87wu3sxgt9m5s03xfytvz7",
                amount: BigNumber(100),
              },
            ],
            fees: BigNumber(99999999999999999999),
            mode: "claimRewardCompound",
          }),
          expectedStatus: {
            errors: {},
            warnings: { claimReward: new ClaimRewardsFeesWarning() },
          },
        },
      ],
    },
    {
      FIXME_tests: ["balance is sum of ops"],
      raw: {
        id:
          "libcore:1:solana:solanapub1addwnpepqd3nvwwx39pqqvw88sg409675u6wyt4wtzqyt2t0e9y4629t50cdzftxnvz:",
        seedIdentifier:
          "solanapub1addwnpepqd3nvwwx39pqqvw88sg409675u6wyt4wtzqyt2t0e9y4629t50cdzftxnvz",
        name: "Solana Static Account",
        starred: true,
        derivationMode: "",
        index: 0,
        freshAddress: "solana10l6h3qw05u7qduqgafj8wlrx3fjhr8523sm0c3",
        freshAddressPath: "44'/118'/0'/0/0",
        freshAddresses: [],
        blockHeight: 2220318,
        creationDate: "2020-04-01T13:51:08.000Z",
        operationsCount: 0,
        operations: [],
        pendingOperations: [],
        currencyId: "solana",
        unitMagnitude: 6,
        lastSyncDate: "2020-06-11T07:44:10.266Z",
        balance: "1000000",
        spendableBalance: "0",
        balanceHistory: {},
        xpub:
          "solanapub1addwnpepqd3nvwwx39pqqvw88sg409675u6wyt4wtzqyt2t0e9y4629t50cdzftxnvz",
        solanaResources: {
          delegations: [],
          redelegations: [],
          unbondings: [],
          delegatedBalance: "0",
          pendingRewardsBalance: "0",
          unbondingBalance: "1000000",
          withdrawAddress: "",
        },
      },
    },
  ],
};

const currencies = { solana };

const dataset: DatasetTest<Transaction> = {
  implementations: ["libcore"],
  currencies,
};

export default dataset;
