// @flow

import type { BigNumber } from "bignumber.js";
import type {
  TransactionCommon,
  TransactionCommonRaw,
} from "../../types/transaction";

import type { Operation, OperationRaw } from "../../types/operation";
import type { CoreAmount, CoreBigInt, Spec } from "../../libcore/types";

export type CoreStatics = {
  SolanaLikeOperation: Class<CoreSolanaLikeOperation>,
  SolanaLikeAddress: Class<CoreSolanaLikeAddress>,
  SolanaLikeTransactionBuilder: Class<CoreSolanaLikeTransactionBuilder>,
  SolanaLikeTransaction: Class<CoreSolanaLikeTransaction>,
  SolanaLikeMessage: Class<CoreSolanaLikeMessage>,
  SolanaLikeMsgWithdrawDelegationReward: Class<SolanaMsgWithdrawDelegationReward>,
  SolanaLikeAmount: Class<CoreSolanaLikeAmount>,
  SolanaLikeMsgSend: Class<SolanaMsgSend>,
  SolanaLikeMsgDelegate: Class<SolanaMsgDelegate>,
  SolanaLikeMsgUndelegate: Class<SolanaMsgUndelegate>,
  SolanaLikeMsgBeginRedelegate: Class<SolanaMsgRedelegate>,
  SolanaGasLimitRequest: Class<CoreSolanaGasLimitRequest>,
};

export type CoreAccountSpecifics = {
  asSolanaLikeAccount(): Promise<CoreSolanaLikeAccount>,
};

export type CoreOperationSpecifics = {
  asSolanaLikeOperation(): Promise<CoreSolanaLikeOperation>,
};

export type CoreCurrencySpecifics = {};
export type SolanaDelegationStatus =
  | "bonded" //  in the active set that generates rewards
  | "unbonding" // doesn't generate rewards. means the validator has been removed from the active set, but has its voting power "frozen" in case they misbehaved (just like a delegator undelegating). This last 21 days
  | "unbonded"; // doesn't generate rewards. means the validator has been removed from the active set for more than 21 days basically

export type SolanaDelegation = {
  validatorAddress: string,
  amount: BigNumber,
  pendingRewards: BigNumber,
  status: SolanaDelegationStatus,
};

export type SolanaRedelegation = {
  validatorSrcAddress: string,
  validatorDstAddress: string,
  amount: BigNumber,
  completionDate: Date,
};

export type SolanaUnbonding = {
  validatorAddress: string,
  amount: BigNumber,
  completionDate: Date,
};

export type SolanaResources = {|
  delegations: SolanaDelegation[],
  redelegations: SolanaRedelegation[],
  unbondings: SolanaUnbonding[],
  delegatedBalance: BigNumber,
  pendingRewardsBalance: BigNumber,
  unbondingBalance: BigNumber,
  withdrawAddress: string,
|};

export type SolanaDelegationRaw = {|
  validatorAddress: string,
  amount: string,
  pendingRewards: string,
  status: SolanaDelegationStatus,
|};

export type SolanaUnbondingRaw = {|
  validatorAddress: string,
  amount: string,
  completionDate: string,
|};

export type SolanaRedelegationRaw = {|
  validatorSrcAddress: string,
  validatorDstAddress: string,
  amount: string,
  completionDate: string,
|};

export type SolanaResourcesRaw = {|
  delegations: SolanaDelegationRaw[],
  redelegations: SolanaRedelegationRaw[],
  unbondings: SolanaUnbondingRaw[],
  delegatedBalance: string,
  pendingRewardsBalance: string,
  unbondingBalance: string,
  withdrawAddress: string,
|};

// NB this must be serializable (no Date, no BigNumber)
export type SolanaValidatorItem = {|
  validatorAddress: string,
  name: string,
  votingPower: number, // value from 0.0 to 1.0 (normalized percentage)
  commission: number, // value from 0.0 to 1.0 (normalized percentage)
  estimatedYearlyRewardsRate: number, // value from 0.0 to 1.0 (normalized percentage)
|};

export type SolanaRewardsState = {|
  targetBondedRatio: number,
  communityPoolCommission: number,
  assumedTimePerBlock: number,
  inflationRateChange: number,
  inflationMaxRate: number,
  inflationMinRate: number,
  actualBondedRatio: number,
  averageTimePerBlock: number,
  totalSupply: number,
  averageDailyFees: number,
  currentValueInflation: number,
|};

// by convention preload would return a Promise of SolanaPreloadData
export type SolanaPreloadData = {
  validators: SolanaValidatorItem[],
};

export type SolanaOperationMode =
  | "send"
  | "delegate"
  | "undelegate"
  | "redelegate"
  | "claimReward"
  | "claimRewardCompound";

export type NetworkInfo = {|
  family: "solana",
  fees: BigNumber,
|};

export type NetworkInfoRaw = {|
  family: "solana",
  fees: string,
|};

export type SolanaOperation = {|
  ...Operation,
  extra: SolanaExtraTxInfo,
|};

export type SolanaOperationRaw = {|
  ...OperationRaw,
  extra: SolanaExtraTxInfo,
|};

export type SolanaExtraTxInfo =
  | SolanaDelegateTxInfo
  | SolanaUndelegateTxInfo
  | SolanaRedelegateTxInfo
  | SolanaClaimRewardsTxInfo;

export type SolanaDelegateTxInfo = {|
  validators: SolanaDelegationInfo[],
|};

export type SolanaUndelegateTxInfo = {|
  validators: SolanaDelegationInfo[],
|};
export type SolanaRedelegateTxInfo = {|
  validators: SolanaDelegationInfo[],
  solanaSourceValidator: ?string,
|};

export type SolanaClaimRewardsTxInfo = {|
  validator: SolanaDelegationInfo,
|};

export type SolanaDelegationInfo = {
  address: string,
  amount: BigNumber,
};

export type SolanaDelegationInfoRaw = {
  address: string,
  amount: string,
};

export type SolanaMessage = CoreSolanaLikeMessage;

declare class SolanaMsgSend {
  static init(
    fromAddress: string,
    toAddress: string,
    amount: CoreSolanaLikeAmount[]
  ): Promise<SolanaMsgSend>;
  fromAddress: string;
  toAddress: string;
  amount: Array<CoreSolanaLikeAmount>;
}

declare class SolanaMsgDelegate {
  static init(
    delegatorAddress: string,
    validatorAddress: string,
    amount: CoreSolanaLikeAmount
  ): Promise<SolanaMsgDelegate>;
  getValidatorAddress(): Promise<string>;
  getAmount(): Promise<SolanaAmount>;
  delegatorAddress: string;
  validatorAddress: string;
  amount: CoreSolanaLikeAmount;
}

type SolanaMsgUndelegate = SolanaMsgDelegate;

type SolanaAmount = {
  getAmount(): Promise<string>,
  amount: string,
  denom: string,
};

declare class CoreSolanaGasLimitRequest {
  static init(
    memo: string,
    messages: CoreSolanaLikeMessage[],
    amplifier: string
  ): Promise<CoreSolanaGasLimitRequest>;
}

declare class SolanaMsgRedelegate {
  static init(
    delegatorAddress: string,
    validatorSourceAddress: string,
    validatorDestinationAddress: string,
    amount: CoreSolanaLikeAmount
  ): Promise<SolanaMsgRedelegate>;
  getValidatorDestinationAddress(): Promise<string>;
  getValidatorSourceAddress(): Promise<string>;
  getAmount(): Promise<SolanaAmount>;
  delegatorAddress: string;
  validatorSourceAddress: string;
  validatorDestinationAddress: string;
  amount: CoreSolanaLikeAmount;
}

declare class CoreSolanaLikeAmount {
  static init(amount: string, denom: string): Promise<CoreSolanaLikeAmount>;
  getAmount(): Promise<string>;
  amount: string;
  denom: string;
}

declare class SolanaMsgWithdrawDelegationReward {
  static init(
    delegatorAddress: string,
    validatorAddress: string
  ): Promise<SolanaMsgWithdrawDelegationReward>;
  getValidatorAddress(): Promise<string>;
  delegatorAddress: string;
  validatorAddress: string;
}

type SolanaLikeEntry = {
  // Block height of the begin redelegate request
  getCreationHeight(): Promise<CoreBigInt>,
  // Timestamp of the redelegation completion
  getCompletionTime(): Date,
  // Balance requested to redelegate
  getInitialBalance(): Promise<CoreBigInt>,
  // Current amount being redelegated (i.e. less than initialBalance if slashed)
  getBalance(): Promise<CoreBigInt>,
};

export type SolanaLikeRedelegation = {
  getDelegatorAddress(): string,
  getSrcValidatorAddress(): string,
  getDstValidatorAddress(): string,
  getEntries(): SolanaLikeEntry[],
};

export type SolanaLikeUnbonding = {
  getDelegatorAddress(): string,
  getValidatorAddress(): string,
  getEntries(): SolanaLikeEntry[],
};

export type SolanaLikeDelegation = {
  getDelegatorAddress(): string,
  getValidatorAddress(): string,
  getDelegatedAmount(): CoreAmount,
};

declare class CoreSolanaLikeAddress {
  toBech32(): Promise<string>;
}

declare class CoreSolanaLikeOperation {
  getTransaction(): Promise<CoreSolanaLikeTransaction>;
  getMessage(): Promise<CoreSolanaLikeMessage>;
}

declare class CoreSolanaLikeMsgType {}

declare class CoreSolanaLikeMessage {
  getIndex(): Promise<string>;
  getMessageType(): Promise<CoreSolanaLikeMsgType>;
  getRawMessageType(): Promise<string>;
  static wrapMsgSend(message: SolanaMsgSend): Promise<CoreSolanaLikeMessage>;
  static wrapMsgDelegate(
    message: SolanaMsgDelegate
  ): Promise<CoreSolanaLikeMessage>;
  static wrapMsgUndelegate(
    message: SolanaMsgUndelegate
  ): Promise<CoreSolanaLikeMessage>;
  static wrapMsgBeginRedelegate(
    message: SolanaMsgRedelegate
  ): Promise<CoreSolanaLikeMessage>;
  static wrapMsgWithdrawDelegationReward(
    message: SolanaMsgWithdrawDelegationReward
  ): Promise<CoreSolanaLikeMessage>;

  static unwrapMsgDelegate(msg: SolanaMessage): Promise<SolanaMsgDelegate>;
  static unwrapMsgBeginRedelegate(
    msg: SolanaMessage
  ): Promise<SolanaMsgRedelegate>;
  static unwrapMsgUndelegate(msg: SolanaMessage): Promise<SolanaMsgUndelegate>;
  static unwrapMsgWithdrawDelegationReward(
    msg: SolanaMessage
  ): Promise<SolanaMsgWithdrawDelegationReward>;
}

declare class CoreSolanaLikeTransactionBuilder {
  setMemo(memo: string): Promise<CoreSolanaLikeTransactionBuilder>;
  setSequence(sequence: string): Promise<CoreSolanaLikeTransactionBuilder>;
  setAccountNumber(
    accountNumber: string
  ): Promise<CoreSolanaLikeTransactionBuilder>;
  addMessage(
    message: CoreSolanaLikeMessage
  ): Promise<CoreSolanaLikeTransactionBuilder>;
  setFee(fees: CoreAmount): Promise<CoreSolanaLikeTransactionBuilder>;
  setGas(gas: CoreAmount): Promise<CoreSolanaLikeTransactionBuilder>;
  build(): Promise<CoreSolanaLikeTransaction>;
}

declare class CoreSolanaLikeTransaction {
  toRawTransaction(): string;
  toSignatureBase(): Promise<string>;
  getHash(): Promise<string>;
  getMemo(): Promise<string>;
  getFee(): Promise<CoreAmount>;
  getGas(): Promise<CoreAmount>;
  serializeForSignature(): Promise<string>;
  serializeForBroadcast(type: "block" | "async" | "sync"): Promise<string>;
  setSignature(string, string): Promise<void>;
  setDERSignature(string): Promise<void>;
}

declare class SolanaLikeReward {
  getDelegatorAddress(): string;
  getValidatorAddress(): string;
  getRewardAmount(): CoreAmount;
}

export type SolanaLikeValidator = {
  activeStatus: string,
  getActiveStatus(): Promise<string>,
};

export type SolanaBroadcastResponse = {
  code: number,
  raw_log: string,
  txhash: string,
  raw_log: string,
};

declare class CoreSolanaLikeAccount {
  buildTransaction(): Promise<CoreSolanaLikeTransactionBuilder>;
  broadcastRawTransaction(signed: string): Promise<string>;
  broadcastTransaction(signed: string): Promise<string>;
  getEstimatedGasLimit(
    transaction: CoreSolanaLikeTransaction
  ): Promise<CoreBigInt>;
  estimateGas(request: CoreSolanaGasLimitRequest): Promise<CoreBigInt>;
  getBaseReserve(): Promise<CoreAmount>;
  isAddressActivated(address: string): Promise<boolean>;
  getSequence(): Promise<string>;

  getAccountNumber(): Promise<string>;
  getPendingRewards(): Promise<SolanaLikeReward[]>;
  getRedelegations(): Promise<SolanaLikeRedelegation[]>;
  getUnbondings(): Promise<SolanaLikeUnbonding[]>;
  getDelegations(): Promise<SolanaLikeDelegation[]>;
  getValidatorInfo(validatorAddress: string): Promise<SolanaLikeValidator>;
}

export type {
  CoreSolanaLikeAccount,
  CoreSolanaLikeAddress,
  CoreSolanaLikeOperation,
  CoreSolanaLikeTransaction,
  CoreSolanaLikeTransactionBuilder,
};

export type Transaction = {|
  ...TransactionCommon,
  family: "solana",
  mode: SolanaOperationMode,
  networkInfo: ?NetworkInfo,
  fees: ?BigNumber,
  gas: ?BigNumber,
  memo: ?string,
  validators: SolanaDelegationInfo[],
  solanaSourceValidator: ?string,
|};

export type TransactionRaw = {|
  ...TransactionCommonRaw,
  family: "solana",
  mode: SolanaOperationMode,
  networkInfo: ?NetworkInfoRaw,
  fees: ?string,
  gas: ?string,
  memo: ?string,
  validators: SolanaDelegationInfoRaw[],
  solanaSourceValidator: ?string,
|};

export type SolanaMappedDelegation = {
  ...SolanaDelegation,
  formattedAmount: string,
  formattedPendingRewards: string,
  rank: number,
  validator: ?SolanaValidatorItem,
};

export type SolanaMappedUnbonding = {
  ...SolanaUnbonding,
  formattedAmount: string,
  validator: ?SolanaValidatorItem,
};

export type SolanaMappedRedelegation = {
  ...SolanaRedelegation,
  formattedAmount: string,
  validatorSrc: ?SolanaValidatorItem,
  validatorDst: ?SolanaValidatorItem,
};

export type SolanaMappedDelegationInfo = {
  ...SolanaDelegationInfo,
  validator: ?SolanaValidatorItem,
  formattedAmount: string,
};

export type SolanaMappedValidator = {
  rank: number,
  validator: SolanaValidatorItem,
};

export type SolanaSearchFilter = (
  query: string
) => (delegation: SolanaMappedDelegation | SolanaMappedValidator) => boolean;

export const reflect = (declare: (string, Spec) => void) => {
  declare("SolanaLikeTransactionBuilder", {
    methods: {
      addMessage: {
        params: ["SolanaLikeMessage"],
      },
      build: {
        returns: "SolanaLikeTransaction",
      },
      setMemo: {},
      setSequence: {},
      setAccountNumber: {},
      setFee: { params: ["Amount"] },
      setGas: {
        params: ["Amount"],
      },
    },
  });

  declare("SolanaGasLimitRequest", {
    njsUsesPlainObject: true,
    statics: {
      init: {
        params: [null, ["SolanaLikeMessage"], null],
        returns: "SolanaGasLimitRequest",
        njsInstanciateClass: [
          {
            memo: 0,
            messages: 1,
            amplifier: 2,
          },
        ],
      },
    },
  });

  declare("SolanaLikeAccount", {
    methods: {
      estimateGas: {
        params: ["SolanaGasLimitRequest"],
        returns: "BigInt",
      },
      buildTransaction: {
        returns: "SolanaLikeTransactionBuilder",
      },
      broadcastRawTransaction: {},
      broadcastTransaction: {},
      getEstimatedGasLimit: {
        params: ["SolanaLikeTransaction"],
      },
      getSequence: {},
      getAccountNumber: {},
      getPendingRewards: {
        returns: ["SolanaLikeReward"],
      },
      getRedelegations: {
        returns: ["SolanaLikeRedelegation"],
      },
      getUnbondings: {
        returns: ["SolanaLikeUnbonding"],
      },
      getDelegations: {
        returns: ["SolanaLikeDelegation"],
      },
      getValidatorInfo: {
        returns: "SolanaLikeValidator",
      },
    },
  });

  declare("SolanaLikeValidator", {
    njsUsesPlainObject: true,
    methods: {
      getActiveStatus: {
        njsField: "activeStatus",
      },
    },
  });

  declare("SolanaLikeReward", {
    methods: {
      getDelegatorAddress: {},
      getValidatorAddress: {},
      getRewardAmount: {
        returns: "Amount",
      },
    },
  });

  declare("SolanaLikeUnbonding", {
    methods: {
      getDelegatorAddress: {},
      getValidatorAddress: {},
      getEntries: {
        returns: ["SolanaLikeUnbondingEntry"],
      },
    },
  });

  declare("SolanaLikeTransaction", {
    methods: {
      getHash: {},
      getMemo: {},
      setDERSignature: {
        params: ["hex"],
      },
      getFee: {
        returns: "Amount",
      },
      getGas: {
        returns: "Amount",
      },
      serializeForSignature: {},
      serializeForBroadcast: {},
    },
  });

  declare("SolanaLikeOperation", {
    methods: {
      getTransaction: {
        returns: "SolanaLikeTransaction",
      },
      getMessage: {
        returns: "SolanaLikeMessage",
      },
    },
  });

  declare("SolanaLikeRedelegationEntry", {
    methods: {
      getInitialBalance: {
        returns: "BigInt",
      },
      getCompletionTime: {},
    },
  });

  declare("SolanaLikeUnbondingEntry", {
    methods: {
      getInitialBalance: {
        returns: "BigInt",
      },
      getCompletionTime: {},
    },
  });

  declare("SolanaLikeRedelegation", {
    methods: {
      getDelegatorAddress: {
        returns: "string",
      },
      getSrcValidatorAddress: {
        return: "string",
      },
      getDstValidatorAddress: {
        return: "string",
      },
      getEntries: {
        returns: ["SolanaLikeRedelegationEntry"],
      },
    },
  });

  declare("SolanaLikeDelegation", {
    methods: {
      getDelegatorAddress: {},
      getValidatorAddress: {},
      getDelegatedAmount: {
        returns: "Amount",
      },
    },
  });

  declare("SolanaLikeMessage", {
    statics: {
      wrapMsgSend: {
        params: ["SolanaLikeMsgSend"],
        returns: "SolanaLikeMessage",
        njsBuggyMethodIsNotStatic: true,
      },
      wrapMsgDelegate: {
        params: ["SolanaLikeMsgDelegate"],
        returns: "SolanaLikeMessage",
        njsBuggyMethodIsNotStatic: true,
      },
      wrapMsgUndelegate: {
        params: ["SolanaLikeMsgUndelegate"],
        returns: "SolanaLikeMessage",
        njsBuggyMethodIsNotStatic: true,
      },
      wrapMsgBeginRedelegate: {
        params: ["SolanaLikeMsgBeginRedelegate"],
        returns: "SolanaLikeMessage",
        njsBuggyMethodIsNotStatic: true,
      },
      wrapMsgWithdrawDelegationReward: {
        params: ["SolanaLikeMsgWithdrawDelegationReward"],
        returns: "SolanaLikeMessage",
        njsBuggyMethodIsNotStatic: true,
      },
      unwrapMsgDelegate: {
        params: ["SolanaLikeMessage"],
        returns: "SolanaLikeMsgDelegate",
        njsBuggyMethodIsNotStatic: true,
      },
      unwrapMsgBeginRedelegate: {
        params: ["SolanaLikeMessage"],
        returns: "SolanaLikeMsgBeginRedelegate",
        njsBuggyMethodIsNotStatic: true,
      },
      unwrapMsgUndelegate: {
        params: ["SolanaLikeMessage"],
        returns: "SolanaLikeMsgUndelegate",
        njsBuggyMethodIsNotStatic: true,
      },
      unwrapMsgWithdrawDelegationReward: {
        params: ["SolanaLikeMessage"],
        returns: "SolanaLikeMsgWithdrawDelegationReward",
        njsBuggyMethodIsNotStatic: true,
      },
    },
    methods: {
      getMessageType: {},
      getRawMessageType: {},
      getIndex: {},
    },
  });

  declare("SolanaLikeAmount", {
    njsUsesPlainObject: true,
    statics: {
      init: {
        params: [null, null],
        returns: "SolanaLikeAmount",
        njsInstanciateClass: [
          {
            amount: 0,
            denom: 1,
          },
        ],
      },
    },
    methods: {
      getAmount: {
        njsField: "amount",
      },
    },
  });

  declare("SolanaLikeMsgSend", {
    njsUsesPlainObject: true,
    statics: {
      init: {
        params: [null, null, ["SolanaLikeAmount"]],
        returns: "SolanaLikeMsgSend",
        njsInstanciateClass: [
          {
            fromAddress: 0,
            toAddress: 1,
            amount: 2,
          },
        ],
      },
    },
  });

  declare("SolanaLikeMsgDelegate", {
    njsUsesPlainObject: true,
    statics: {
      init: {
        params: [null, null, "SolanaLikeAmount"],
        returns: "SolanaLikeMsgDelegate",
        njsInstanciateClass: [
          {
            delegatorAddress: 0,
            validatorAddress: 1,
            amount: 2,
          },
        ],
      },
    },
    methods: {
      getValidatorAddress: {
        njsField: "validatorAddress",
      },
      getAmount: {
        njsField: "amount",
        returns: "SolanaLikeAmount",
      },
    },
  });

  declare("SolanaLikeMsgBeginRedelegate", {
    njsUsesPlainObject: true,
    statics: {
      init: {
        params: [null, null, null, "SolanaLikeAmount"],
        returns: "SolanaLikeMsgBeginRedelegate",
        njsInstanciateClass: [
          {
            delegatorAddress: 0,
            validatorSourceAddress: 1,
            validatorDestinationAddress: 2,
            amount: 3,
          },
        ],
      },
    },
    methods: {
      getValidatorDestinationAddress: {
        njsField: "validatorDestinationAddress",
      },
      getValidatorSourceAddress: {
        njsField: "validatorSourceAddress",
      },
      getAmount: {
        njsField: "amount",
        returns: "SolanaLikeAmount",
      },
    },
  });

  declare("SolanaLikeMsgUndelegate", {
    njsUsesPlainObject: true,
    statics: {
      init: {
        params: [null, null, "SolanaLikeAmount"],
        returns: "SolanaLikeMsgUndelegate",
        njsInstanciateClass: [
          {
            delegatorAddress: 0,
            validatorAddress: 1,
            amount: 2,
          },
        ],
      },
    },
    methods: {
      getValidatorAddress: {
        njsField: "validatorAddress",
      },
      getAmount: {
        njsField: "amount",
        returns: "SolanaLikeAmount",
      },
    },
  });

  declare("SolanaLikeMsgWithdrawDelegationReward", {
    njsUsesPlainObject: true,
    statics: {
      init: {
        params: [null, null],
        returns: "SolanaLikeMsgWithdrawDelegationReward",
        njsInstanciateClass: [
          {
            delegatorAddress: 0,
            validatorAddress: 1,
          },
        ],
      },
    },
    methods: {
      getDelegatorAddress: {
        njsField: "delegatorAddress",
      },
      getValidatorAddress: {
        njsField: "validatorAddress",
      },
    },
  });

  return {
    OperationMethods: {
      asSolanaLikeOperation: {
        returns: "SolanaLikeOperation",
      },
    },
    AccountMethods: {
      asSolanaLikeAccount: {
        returns: "SolanaLikeAccount",
      },
    },
  };
};
