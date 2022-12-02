// This component will simply add utility functions to your developer console.
import { useSubstrateState } from "context/SubstrateContext";

export default function DeveloperConsole(props: any) {
  const { api, apiState, keyring, keyringState } = useSubstrateState();
  if (typeof window !== "undefined") {
    if (apiState === "READY") {
      // @ts-ignore
      window.api = api;
    }
    if (keyringState === "READY") {
      // @ts-ignore
      window.keyring = keyring;
    }
    // @ts-ignore
    window.util = require("@polkadot/util");
    // @ts-ignore
    window.utilCrypto = require("@polkadot/util-crypto");
  }

  return null;
}
