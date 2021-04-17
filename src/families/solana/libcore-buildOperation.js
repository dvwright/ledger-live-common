// @flow

import type { Operation } from "../../types";
import type { Core, CoreOperation } from "../../libcore/types";
import { BigNumber } from "bignumber.js";

const translateExtraInfo = async (core: Core, msg, type) => {
  let unwrapped, amount, address, solanaSourceValidator;
  switch (type) {
    case "DELEGATE": {
      unwrapped = await core.SolanaLikeMessage.unwrapMsgDelegate(msg);
      const solanaAmount = await unwrapped.getAmount();
      amount = await solanaAmount.getAmount();
      address = await unwrapped.getValidatorAddress();
      break;
    }

    case "UNDELEGATE": {
      unwrapped = await core.SolanaLikeMessage.unwrapMsgUndelegate(msg);
      const solanaAmount = await unwrapped.getAmount();
      amount = await solanaAmount.getAmount();
      address = await unwrapped.getValidatorAddress();
      break;
    }

    case "REWARD": {
      unwrapped = await core.SolanaLikeMessage.unwrapMsgWithdrawDelegationReward(
        msg
      );
      address = await unwrapped.getValidatorAddress();
      amount = BigNumber(0);
      break;
    }

    case "REDELEGATE": {
      unwrapped = await core.SolanaLikeMessage.unwrapMsgBeginRedelegate(msg);
      const solanaAmount = await unwrapped.getAmount();
      amount = await solanaAmount.getAmount();
      address = await unwrapped.getValidatorDestinationAddress();
      solanaSourceValidator = await unwrapped.getValidatorSourceAddress();
      return {
        validators: [
          {
            address,
            amount,
          },
        ],
        solanaSourceValidator,
      };
    }
  }

  return {
    validators: [
      {
        address,
        amount,
      },
    ],
  };
};

async function solanaBuildOperation({
  core,
  coreOperation,
}: {
  core: Core,
  coreOperation: CoreOperation,
}) {
  const solanaLikeOperation = await coreOperation.asSolanaLikeOperation();
  const solanaLikeTransaction = await solanaLikeOperation.getTransaction();
  const hash = await solanaLikeTransaction.getHash();
  const memo = await solanaLikeTransaction.getMemo();
  const message = await solanaLikeOperation.getMessage();
  const out: $Shape<Operation> = {
    hash,
  };

  switch (await message.getRawMessageType()) {
    case "internal/MsgFees":
      out.type = "FEES";
      break;

    case "solana-sdk/MsgDelegate":
      out.type = "DELEGATE";
      out.extra = await translateExtraInfo(core, message, out.type);
      break;

    case "solana-sdk/MsgUndelegate":
      out.type = "UNDELEGATE";
      out.extra = await translateExtraInfo(core, message, out.type);
      break;

    case "solana-sdk/MsgWithdrawDelegationReward":
      out.type = "REWARD";
      out.extra = await translateExtraInfo(core, message, out.type);
      break;

    case "solana-sdk/MsgBeginRedelegate":
      out.type = "REDELEGATE";
      out.extra = await translateExtraInfo(core, message, out.type);
      break;
  }

  out.extra = { ...out.extra, id: await message.getIndex() };

  if (memo) {
    out.extra = { ...out.extra, memo };
  }

  return out;
}

export default solanaBuildOperation;
