// @flow

import Solana from "@ledgerhq/hw-app-solana";
import type { Resolver } from "../../hw/getAddress/types";

const resolver: Resolver = async (transport, { path, verify }) => {
  const solana = new Solana(transport);

  const r = await solana.getAddress(path, "solana", verify || false);

  return {
    address: r.address,
    publicKey: r.publicKey,
    path,
  };
};

export default resolver;
