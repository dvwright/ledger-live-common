// @flow

import type { Transaction, SolanaMessage } from "./types";
import type { Core } from "../../libcore/types";
import { promiseAllBatched } from "../../promise";
import type { CryptoCurrency } from "../../types";

const getAmount = async (
  core: Core,
  currency: CryptoCurrency,
  amount: string
) => {
  return await core.SolanaLikeAmount.init(
    amount,
    currency.id === "solana_testnet" ? "umuon" : "uatom"
  );
};

export const solanaCreateMessage = async (
  freshAddress: string,
  transaction: Transaction,
  core: Core,
  currency: CryptoCurrency
): Promise<SolanaMessage[]> => {
  const { recipient } = transaction;

  switch (transaction.mode) {
    case "send":
      return [
        await core.SolanaLikeMessage.wrapMsgSend(
          await core.SolanaLikeMsgSend.init(freshAddress, recipient, [
            await getAmount(core, currency, transaction.amount.toString()),
          ])
        ),
      ];

    case "delegate": {
      const { validators } = transaction;
      if (!validators || validators.length === 0) {
        throw new Error("no validators");
      }
      return await promiseAllBatched(
        2,
        validators,
        async (validator) =>
          await core.SolanaLikeMessage.wrapMsgDelegate(
            await core.SolanaLikeMsgDelegate.init(
              freshAddress,
              validator.address,
              await getAmount(core, currency, validator.amount.toString())
            )
          )
      );
    }

    case "undelegate": {
      const { validators } = transaction;
      if (!validators || validators.length === 0) {
        throw new Error("no validators");
      }
      return await promiseAllBatched(
        2,
        validators,
        async (validator) =>
          await core.SolanaLikeMessage.wrapMsgUndelegate(
            await core.SolanaLikeMsgUndelegate.init(
              freshAddress,
              validator.address,
              await getAmount(core, currency, validator.amount.toString())
            )
          )
      );
    }

    case "redelegate": {
      const { solanaSourceValidator } = transaction;
      if (!solanaSourceValidator) {
        throw new Error("source validator is empty");
      }
      const { validators } = transaction;
      if (!validators || validators.length === 0) {
        throw new Error("no validators");
      }
      return await promiseAllBatched(
        2,
        validators,
        async (validator) =>
          await core.SolanaLikeMessage.wrapMsgBeginRedelegate(
            await core.SolanaLikeMsgBeginRedelegate.init(
              freshAddress,
              solanaSourceValidator,
              validator.address,
              await getAmount(core, currency, validator.amount.toString())
            )
          )
      );
    }

    case "claimReward": {
      const { validators } = transaction;
      if (!validators || validators.length === 0) {
        throw new Error("no validators");
      }
      return await promiseAllBatched(
        2,
        validators,
        async (validator) =>
          await core.SolanaLikeMessage.wrapMsgWithdrawDelegationReward(
            await core.SolanaLikeMsgWithdrawDelegationReward.init(
              freshAddress,
              validator.address
            )
          )
      );
    }

    case "claimRewardCompound": {
      const { validators } = transaction;
      if (!validators || validators.length === 0) {
        throw new Error("no validators");
      }
      return [
        ...(await promiseAllBatched(2, validators, async (validator) => {
          return await core.SolanaLikeMessage.wrapMsgWithdrawDelegationReward(
            await core.SolanaLikeMsgWithdrawDelegationReward.init(
              freshAddress,
              validator.address
            )
          );
        })),
        ...(await promiseAllBatched(2, validators, async (validator) => {
          return await core.SolanaLikeMessage.wrapMsgDelegate(
            await core.SolanaLikeMsgDelegate.init(
              freshAddress,
              validator.address,
              await getAmount(core, currency, validator.amount.toString())
            )
          );
        })),
      ];
    }
  }
  throw new Error(`unknown message : ${transaction.mode}`);
};
