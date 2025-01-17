// @flow

import SolanaApp from "@ledgerhq/hw-app-solana";
import { makeSignOperation } from "../../libcore/signOperation";
import buildTransaction from "./libcore-buildTransaction";
import type { Transaction, CoreSolanaLikeTransaction } from "./types";
import { libcoreAmountToBigNumber } from "../../libcore/buildBigNumber";

async function signTransaction({
  account: { freshAddressPath, spendableBalance, id, freshAddress },
  transport,
  transaction,
  coreTransaction,
  isCancelled,
  onDeviceSignatureGranted,
  onDeviceSignatureRequested,
}) {
  const hwApp = new SolanaApp(transport);
  const serialized = await coreTransaction.serializeForSignature();

  onDeviceSignatureRequested();
  const { signature } = await hwApp.sign(freshAddressPath, serialized);
  onDeviceSignatureGranted();

  if (signature) {
    await coreTransaction.setDERSignature(signature.toString("hex"));
  } else {
    throw new Error("Solana: no Signature Found");
  }
  if (isCancelled()) return;

  // Serialize the transaction to be broadcast
  // @param mode The supported broadcast modes include
  //        "block"(return after tx commit), (https://docs.solana.network/master/basics/tx-lifecycle.html#commit)
  //        "sync"(return afer CheckTx), (https://docs.solana.network/master/basics/tx-lifecycle.html#types-of-checks) and
  //        "async"(return right away).
  const hex = await coreTransaction.serializeForBroadcast("sync");

  if (isCancelled()) return;

  const feesRaw = await coreTransaction.getFee();
  if (isCancelled()) return;

  const fee = await libcoreAmountToBigNumber(feesRaw);
  if (isCancelled()) return;

  const recipients = [transaction.recipient];
  if (isCancelled()) return;

  const senders = [freshAddress];
  if (isCancelled()) return;

  const type =
    transaction.mode === "undelegate"
      ? "UNDELEGATE"
      : transaction.mode === "delegate"
      ? "DELEGATE"
      : transaction.mode === "redelegate"
      ? "REDELEGATE"
      : ["claimReward", "claimRewardCompound"].includes(transaction.mode)
      ? "REWARD"
      : "OUT";

  const extra = {};
  if (transaction.mode === "redelegate") {
    extra.solanaSourceValidator = transaction.solanaSourceValidator;
  }
  if (transaction.mode !== "send") {
    extra.validators = transaction.validators;
  }

  const op = {
    id: `${id}--${type}`,
    hash: "",
    type,
    value: transaction.useAllAmount
      ? spendableBalance
      : transaction.amount.plus(fee),
    fee,
    blockHash: null,
    blockHeight: null,
    senders,
    recipients,
    accountId: id,
    date: new Date(),
    extra,
  };

  return {
    operation: op,
    expirationDate: null,
    signature: hex,
  };
}

export default makeSignOperation<Transaction, CoreSolanaLikeTransaction>({
  buildTransaction,
  signTransaction,
});
