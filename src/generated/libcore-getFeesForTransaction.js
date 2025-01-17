// @flow
import algorand from "../families/algorand/libcore-getFeesForTransaction.js";
import bitcoin from "../families/bitcoin/libcore-getFeesForTransaction.js";
import cosmos from "../families/cosmos/libcore-getFeesForTransaction.js";
import solana from "../families/solana/libcore-getFeesForTransaction.js";
import tezos from "../families/tezos/libcore-getFeesForTransaction.js";

export default {
  algorand,
  bitcoin,
  cosmos,
  solana,
  tezos,
};
