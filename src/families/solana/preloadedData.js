// @flow
import { Observable, Subject } from "rxjs";
import type { SolanaPreloadData } from "./types";

// this module holds the cached state of preload()

// eslint-disable-next-line no-unused-vars
let currentSolanaPreloadedData: SolanaPreloadData = {
  // NB initial state because UI need to work even if it's currently "loading", typically after clear cache
  validators: [],
};

export function asSafeSolanaPreloadData(data: mixed): SolanaPreloadData {
  // NB this function must not break and be resilient to changes in data
  const validators = [];
  if (typeof data === "object" && data) {
    const validatorsUnsafe = data.validators;
    if (
      typeof validatorsUnsafe === "object" &&
      validatorsUnsafe &&
      Array.isArray(validatorsUnsafe)
    ) {
      validatorsUnsafe.forEach((v) => {
        // FIXME if model changes, we should validate the object
        validators.push(v);
      });
    }
  }

  return {
    validators,
  };
}

const updates = new Subject<SolanaPreloadData>();

export function setSolanaPreloadData(data: SolanaPreloadData) {
  if (data === currentSolanaPreloadedData) return;
  currentSolanaPreloadedData = data;
  updates.next(data);
}

export function getCurrentSolanaPreloadData(): SolanaPreloadData {
  return currentSolanaPreloadedData;
}

export function getSolanaPreloadDataUpdates(): Observable<SolanaPreloadData> {
  return updates.asObservable();
}
