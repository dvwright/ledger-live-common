// @flow

import { BigNumber } from "bignumber.js";
import { solanaCreateMessage } from "./message";
import { withLibcore } from "../../libcore/access";
import { getCryptoCurrencyById } from "../../currencies";

export default () => {
  describe("solanaCreateMessage", () => {
    const commonTransaction = {
      family: "solana",
      fees: null,
      gas: null,
      recipient: "",
      useAllAmount: false,
      networkInfo: null,
      memo: null,
      solanaSourceValidator: null,
      validators: [],
    };

    const sourceAddresss = "solana1g84934jpu3v5de5yqukkkhxmcvsw3u2ajxvpdl";
    const currency = getCryptoCurrencyById("solana");

    test("create a message send", async () => {
      const messages = await withLibcore(async (core) => {
        return await solanaCreateMessage(
          sourceAddresss,
          {
            ...commonTransaction,
            amount: BigNumber(3000),
            mode: "send",
          },
          core,
          currency
        );
      });

      expect(messages[0].constructor.name).toBe("NJSSolanaLikeMessage");
      expect(messages.length).toBe(1);
    });

    test("create a message delegate that throw and error", async () => {
      await withLibcore(async (core) => {
        try {
          return await solanaCreateMessage(
            sourceAddresss,
            {
              ...commonTransaction,
              amount: BigNumber(3000),
              mode: "delegate",
            },
            core,
            currency
          );
        } catch (e) {
          expect(e.message).toBe("no validators");
        }
      });
    });

    test("create a message delegate with multiples validators", async () => {
      const messages = await withLibcore(async (core) => {
        return await solanaCreateMessage(
          sourceAddresss,
          {
            ...commonTransaction,
            amount: BigNumber(3000),
            mode: "delegate",
            validators: [
              { amount: BigNumber(3000), address: "" },
              { amount: BigNumber(3000), address: "" },
              { amount: BigNumber(3000), address: "" },
            ],
          },
          core,
          currency
        );
      });

      expect(messages[0].constructor.name).toBe("NJSSolanaLikeMessage");
      expect(messages[1].constructor.name).toBe("NJSSolanaLikeMessage");
      expect(messages[2].constructor.name).toBe("NJSSolanaLikeMessage");
      expect(messages.length).toBe(3);
    });

    test("create a message delegate", async () => {
      const messages = await withLibcore(async (core) => {
        return await solanaCreateMessage(
          sourceAddresss,
          {
            ...commonTransaction,
            amount: BigNumber(3000),
            mode: "delegate",
            validators: [{ amount: BigNumber(3000), address: "" }],
          },
          core,
          currency
        );
      });

      expect(messages[0].constructor.name).toBe("NJSSolanaLikeMessage");
      expect(messages.length).toBe(1);
    });

    test("create a message undelegate", async () => {
      const messages = await withLibcore(async (core) => {
        return await solanaCreateMessage(
          sourceAddresss,
          {
            ...commonTransaction,
            amount: BigNumber(3000),
            mode: "undelegate",
            validators: [{ amount: BigNumber(3000), address: "" }],
          },
          core,
          currency
        );
      });

      expect(messages[0].constructor.name).toBe("NJSSolanaLikeMessage");
      expect(messages.length).toBe(1);
    });

    test("create a message redelegate - without solanaSourceValidator", async () => {
      await withLibcore(async (core) => {
        try {
          return await solanaCreateMessage(
            sourceAddresss,
            {
              ...commonTransaction,
              amount: BigNumber(0),
              mode: "redelegate",
              solanaSourceValidator: null,
              validators: [{ amount: BigNumber(3000), address: "" }],
            },
            core,
            currency
          );
        } catch (e) {
          expect(e.message).toBe("source validator is empty");
        }
      });
    });

    test("create a message redelegate", async () => {
      const messages = await withLibcore(async (core) => {
        return await solanaCreateMessage(
          sourceAddresss,
          {
            ...commonTransaction,
            amount: BigNumber(3000),
            mode: "redelegate",
            solanaSourceValidator: "source",
            validators: [{ amount: BigNumber(3000), address: "" }],
          },
          core,
          currency
        );
      });

      expect(messages[0].constructor.name).toBe("NJSSolanaLikeMessage");
      expect(messages.length).toBe(1);
    });

    test("create a message claimReward", async () => {
      const messages = await withLibcore(async (core) => {
        return await solanaCreateMessage(
          sourceAddresss,
          {
            ...commonTransaction,
            amount: BigNumber(0),
            mode: "claimReward",
            validators: [{ amount: BigNumber(0), address: "" }],
          },
          core,
          currency
        );
      });

      expect(messages[0].constructor.name).toBe("NJSSolanaLikeMessage");
      expect(messages.length).toBe(1);
    });

    test("create a message claimRewardCompound", async () => {
      const messages = await withLibcore(async (core) => {
        return await solanaCreateMessage(
          sourceAddresss,
          {
            ...commonTransaction,
            amount: BigNumber(0),
            mode: "claimRewardCompound",
            validators: [{ amount: BigNumber(0), address: "" }],
          },
          core,
          currency
        );
      });

      expect(messages[0].constructor.name).toBe("NJSSolanaLikeMessage");
      expect(messages[1].constructor.name).toBe("NJSSolanaLikeMessage");
      expect(messages.length).toBe(2);
    });
  });
};
