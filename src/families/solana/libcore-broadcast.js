// @flow
import type { Operation } from "../../types";
import type { SolanaBroadcastResponse } from "./types";
import { makeBroadcast } from "../../libcore/broadcast";
import { SolanaBroadcastError } from "../../errors";
import { patchOperationWithHash } from "../../operation";

async function broadcast({
  coreAccount,
  signedOperation: { operation, signature },
}): Promise<Operation> {
  const solanaLikeAccount = await coreAccount.asSolanaLikeAccount();
  const res = await solanaLikeAccount.broadcastRawTransaction(signature);
  const parsed: SolanaBroadcastResponse = JSON.parse(res);
  if (parsed.code && parsed.code > 0) {
    throw new SolanaBroadcastError[parsed.code]();
  }
  return patchOperationWithHash(operation, parsed.txhash);
}

export default makeBroadcast({ broadcast });
