// @flow
import { reflect as algorandReflect } from "../families/algorand/types";
import type { CoreStatics as CoreStatics_algorand } from "../families/algorand/types";
import type { CoreAccountSpecifics as CoreAccountSpecifics_algorand } from "../families/algorand/types";
import type { CoreOperationSpecifics as CoreOperationSpecifics_algorand } from "../families/algorand/types";
import type { CoreCurrencySpecifics as CoreCurrencySpecifics_algorand } from "../families/algorand/types";
import type { Transaction as algorandTransaction } from "../families/algorand/types";
import type { TransactionRaw as algorandTransactionRaw } from "../families/algorand/types";
import { reflect as bitcoinReflect } from "../families/bitcoin/types";
import type { CoreStatics as CoreStatics_bitcoin } from "../families/bitcoin/types";
import type { CoreAccountSpecifics as CoreAccountSpecifics_bitcoin } from "../families/bitcoin/types";
import type { CoreOperationSpecifics as CoreOperationSpecifics_bitcoin } from "../families/bitcoin/types";
import type { CoreCurrencySpecifics as CoreCurrencySpecifics_bitcoin } from "../families/bitcoin/types";
import type { Transaction as bitcoinTransaction } from "../families/bitcoin/types";
import type { TransactionRaw as bitcoinTransactionRaw } from "../families/bitcoin/types";
import type { NetworkInfo as bitcoinNetworkInfo } from "../families/bitcoin/types";
import type { NetworkInfoRaw as bitcoinNetworkInfoRaw } from "../families/bitcoin/types";
import { reflect as cosmosReflect } from "../families/cosmos/types";
import type { CoreStatics as CoreStatics_cosmos } from "../families/cosmos/types";
import type { CoreAccountSpecifics as CoreAccountSpecifics_cosmos } from "../families/cosmos/types";
import type { CoreOperationSpecifics as CoreOperationSpecifics_cosmos } from "../families/cosmos/types";
import type { CoreCurrencySpecifics as CoreCurrencySpecifics_cosmos } from "../families/cosmos/types";
import type { Transaction as cosmosTransaction } from "../families/cosmos/types";
import type { TransactionRaw as cosmosTransactionRaw } from "../families/cosmos/types";
import type { NetworkInfo as cosmosNetworkInfo } from "../families/cosmos/types";
import type { NetworkInfoRaw as cosmosNetworkInfoRaw } from "../families/cosmos/types";
import { reflect as ethereumReflect } from "../families/ethereum/types";
import type { CoreStatics as CoreStatics_ethereum } from "../families/ethereum/types";
import type { CoreAccountSpecifics as CoreAccountSpecifics_ethereum } from "../families/ethereum/types";
import type { CoreOperationSpecifics as CoreOperationSpecifics_ethereum } from "../families/ethereum/types";
import type { CoreCurrencySpecifics as CoreCurrencySpecifics_ethereum } from "../families/ethereum/types";
import type { Transaction as ethereumTransaction } from "../families/ethereum/types";
import type { TransactionRaw as ethereumTransactionRaw } from "../families/ethereum/types";
import type { NetworkInfo as ethereumNetworkInfo } from "../families/ethereum/types";
import type { NetworkInfoRaw as ethereumNetworkInfoRaw } from "../families/ethereum/types";
import { reflect as neoReflect } from "../families/neo/types";
import type { CoreStatics as CoreStatics_neo } from "../families/neo/types";
import type { CoreAccountSpecifics as CoreAccountSpecifics_neo } from "../families/neo/types";
import type { CoreOperationSpecifics as CoreOperationSpecifics_neo } from "../families/neo/types";
import type { CoreCurrencySpecifics as CoreCurrencySpecifics_neo } from "../families/neo/types";
import type { Transaction as neoTransaction } from "../families/neo/types";
import type { TransactionRaw as neoTransactionRaw } from "../families/neo/types";
import type { NetworkInfo as neoNetworkInfo } from "../families/neo/types";
import type { NetworkInfoRaw as neoNetworkInfoRaw } from "../families/neo/types";
import { reflect as polkadotReflect } from "../families/polkadot/types";
import type { CoreStatics as CoreStatics_polkadot } from "../families/polkadot/types";
import type { CoreAccountSpecifics as CoreAccountSpecifics_polkadot } from "../families/polkadot/types";
import type { CoreOperationSpecifics as CoreOperationSpecifics_polkadot } from "../families/polkadot/types";
import type { CoreCurrencySpecifics as CoreCurrencySpecifics_polkadot } from "../families/polkadot/types";
import type { Transaction as polkadotTransaction } from "../families/polkadot/types";
import type { TransactionRaw as polkadotTransactionRaw } from "../families/polkadot/types";
import { reflect as rippleReflect } from "../families/ripple/types";
import type { CoreStatics as CoreStatics_ripple } from "../families/ripple/types";
import type { CoreAccountSpecifics as CoreAccountSpecifics_ripple } from "../families/ripple/types";
import type { CoreOperationSpecifics as CoreOperationSpecifics_ripple } from "../families/ripple/types";
import type { CoreCurrencySpecifics as CoreCurrencySpecifics_ripple } from "../families/ripple/types";
import type { Transaction as rippleTransaction } from "../families/ripple/types";
import type { TransactionRaw as rippleTransactionRaw } from "../families/ripple/types";
import type { NetworkInfo as rippleNetworkInfo } from "../families/ripple/types";
import type { NetworkInfoRaw as rippleNetworkInfoRaw } from "../families/ripple/types";
import { reflect as solanaReflect } from "../families/solana/types";
import type { CoreStatics as CoreStatics_solana } from "../families/solana/types";
import type { CoreAccountSpecifics as CoreAccountSpecifics_solana } from "../families/solana/types";
import type { CoreOperationSpecifics as CoreOperationSpecifics_solana } from "../families/solana/types";
import type { CoreCurrencySpecifics as CoreCurrencySpecifics_solana } from "../families/solana/types";
import type { Transaction as solanaTransaction } from "../families/solana/types";
import type { TransactionRaw as solanaTransactionRaw } from "../families/solana/types";
import type { NetworkInfo as solanaNetworkInfo } from "../families/solana/types";
import type { NetworkInfoRaw as solanaNetworkInfoRaw } from "../families/solana/types";
import { reflect as stellarReflect } from "../families/stellar/types";
import type { CoreStatics as CoreStatics_stellar } from "../families/stellar/types";
import type { CoreAccountSpecifics as CoreAccountSpecifics_stellar } from "../families/stellar/types";
import type { CoreOperationSpecifics as CoreOperationSpecifics_stellar } from "../families/stellar/types";
import type { CoreCurrencySpecifics as CoreCurrencySpecifics_stellar } from "../families/stellar/types";
import type { Transaction as stellarTransaction } from "../families/stellar/types";
import type { TransactionRaw as stellarTransactionRaw } from "../families/stellar/types";
import type { NetworkInfo as stellarNetworkInfo } from "../families/stellar/types";
import type { NetworkInfoRaw as stellarNetworkInfoRaw } from "../families/stellar/types";
import { reflect as tezosReflect } from "../families/tezos/types";
import type { CoreStatics as CoreStatics_tezos } from "../families/tezos/types";
import type { CoreAccountSpecifics as CoreAccountSpecifics_tezos } from "../families/tezos/types";
import type { CoreOperationSpecifics as CoreOperationSpecifics_tezos } from "../families/tezos/types";
import type { CoreCurrencySpecifics as CoreCurrencySpecifics_tezos } from "../families/tezos/types";
import type { Transaction as tezosTransaction } from "../families/tezos/types";
import type { TransactionRaw as tezosTransactionRaw } from "../families/tezos/types";
import type { NetworkInfo as tezosNetworkInfo } from "../families/tezos/types";
import type { NetworkInfoRaw as tezosNetworkInfoRaw } from "../families/tezos/types";
import { reflect as tronReflect } from "../families/tron/types";
import type { CoreStatics as CoreStatics_tron } from "../families/tron/types";
import type { CoreAccountSpecifics as CoreAccountSpecifics_tron } from "../families/tron/types";
import type { CoreOperationSpecifics as CoreOperationSpecifics_tron } from "../families/tron/types";
import type { CoreCurrencySpecifics as CoreCurrencySpecifics_tron } from "../families/tron/types";
import type { Transaction as tronTransaction } from "../families/tron/types";
import type { TransactionRaw as tronTransactionRaw } from "../families/tron/types";
import type { NetworkInfo as tronNetworkInfo } from "../families/tron/types";
import type { NetworkInfoRaw as tronNetworkInfoRaw } from "../families/tron/types";

export type SpecificStatics = {}
& CoreStatics_algorand
& CoreStatics_bitcoin
& CoreStatics_cosmos
& CoreStatics_ethereum
& CoreStatics_neo
& CoreStatics_polkadot
& CoreStatics_ripple
& CoreStatics_solana
& CoreStatics_stellar
& CoreStatics_tezos
& CoreStatics_tron
export type CoreAccountSpecifics = {}
& CoreAccountSpecifics_algorand
& CoreAccountSpecifics_bitcoin
& CoreAccountSpecifics_cosmos
& CoreAccountSpecifics_ethereum
& CoreAccountSpecifics_neo
& CoreAccountSpecifics_polkadot
& CoreAccountSpecifics_ripple
& CoreAccountSpecifics_solana
& CoreAccountSpecifics_stellar
& CoreAccountSpecifics_tezos
& CoreAccountSpecifics_tron
export type CoreOperationSpecifics = {}
& CoreOperationSpecifics_algorand
& CoreOperationSpecifics_bitcoin
& CoreOperationSpecifics_cosmos
& CoreOperationSpecifics_ethereum
& CoreOperationSpecifics_neo
& CoreOperationSpecifics_polkadot
& CoreOperationSpecifics_ripple
& CoreOperationSpecifics_solana
& CoreOperationSpecifics_stellar
& CoreOperationSpecifics_tezos
& CoreOperationSpecifics_tron
export type CoreCurrencySpecifics = {}
& CoreCurrencySpecifics_algorand
& CoreCurrencySpecifics_bitcoin
& CoreCurrencySpecifics_cosmos
& CoreCurrencySpecifics_ethereum
& CoreCurrencySpecifics_neo
& CoreCurrencySpecifics_polkadot
& CoreCurrencySpecifics_ripple
& CoreCurrencySpecifics_solana
& CoreCurrencySpecifics_stellar
& CoreCurrencySpecifics_tezos
& CoreCurrencySpecifics_tron
export type Transaction =
  | algorandTransaction
  | bitcoinTransaction
  | cosmosTransaction
  | ethereumTransaction
  | neoTransaction
  | polkadotTransaction
  | rippleTransaction
  | solanaTransaction
  | stellarTransaction
  | tezosTransaction
  | tronTransaction
export type TransactionRaw =
  | algorandTransactionRaw
  | bitcoinTransactionRaw
  | cosmosTransactionRaw
  | ethereumTransactionRaw
  | neoTransactionRaw
  | polkadotTransactionRaw
  | rippleTransactionRaw
  | solanaTransactionRaw
  | stellarTransactionRaw
  | tezosTransactionRaw
  | tronTransactionRaw
export type NetworkInfo =
  | bitcoinNetworkInfo
  | cosmosNetworkInfo
  | ethereumNetworkInfo
  | neoNetworkInfo
  | rippleNetworkInfo
  | solanaNetworkInfo
  | stellarNetworkInfo
  | tezosNetworkInfo
  | tronNetworkInfo
export type NetworkInfoRaw =
  | bitcoinNetworkInfoRaw
  | cosmosNetworkInfoRaw
  | ethereumNetworkInfoRaw
  | neoNetworkInfoRaw
  | rippleNetworkInfoRaw
  | solanaNetworkInfoRaw
  | stellarNetworkInfoRaw
  | tezosNetworkInfoRaw
  | tronNetworkInfoRaw
export const reflectSpecifics = (declare: *) => [
  algorandReflect(declare),
  bitcoinReflect(declare),
  cosmosReflect(declare),
  ethereumReflect(declare),
  neoReflect(declare),
  polkadotReflect(declare),
  rippleReflect(declare),
  solanaReflect(declare),
  stellarReflect(declare),
  tezosReflect(declare),
  tronReflect(declare),
];
