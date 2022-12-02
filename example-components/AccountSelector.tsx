import React, { useState, useEffect } from "react";

import {
  Menu,
  Button,
  Dropdown,
  Container,
  Icon,
  Label
} from "semantic-ui-react";

import { useSubstrate, useSubstrateState } from "context/SubstrateContext";

const CHROME_EXT_URL =
  "https://chrome.google.com/webstore/detail/polkadot%7Bjs%7D-extension/mopnmbcafieddcagagdcbnhejhlodfdd";
const FIREFOX_ADDON_URL =
  "https://addons.mozilla.org/en-US/firefox/addon/polkadot-js-extension/";

const acctAddr = (acct: any) => (acct ? acct.address : "");

function Main(props: any) {
  const {
    setCurrentAccount,
    state: { keyring, currentAccount }
  } = useSubstrate();

  // Get the list of accounts we possess the private key for
  const keyringOptions = keyring.getPairs().map((account: any) => ({
    key: account.address,
    value: account.address,
    text: account.meta.name.toUpperCase(),
    icon: "user"
  }));

  const initialAddress =
    keyringOptions.length > 0 ? keyringOptions[0].value : "";

  // Set the initial address
  useEffect(() => {
    // `setCurrentAccount()` is called only when currentAccount is null (uninitialized)
    !currentAccount &&
      initialAddress.length > 0 &&
      setCurrentAccount(keyring.getPair(initialAddress));
  }, [currentAccount, setCurrentAccount, keyring, initialAddress]);

  const onChange = (addr: any) => {
    setCurrentAccount(keyring.getPair(addr));
  };

  return (
    <Menu
      attached="top"
      tabular
      style={{
        backgroundColor: "#fff",
        borderColor: "#fff",
        paddingTop: "1em",
        paddingBottom: "1em"
      }}
    >
      <Container>
        <Menu.Menu position="right" style={{ alignItems: "center" }}>
          {!currentAccount ? (
            <span>
              Create an account with Polkadot-JS Extension (
              <a target="_blank" rel="noreferrer" href={CHROME_EXT_URL}>
                Chrome
              </a>
              ,&nbsp;
              <a target="_blank" rel="noreferrer" href={FIREFOX_ADDON_URL}>
                Firefox
              </a>
              )&nbsp;
            </span>
          ) : null}
          <Button
            basic
            circular
            size="large"
            icon="user"
            color={currentAccount ? "green" : "red"}
            onClick={() =>
              navigator.clipboard.writeText(acctAddr(currentAccount))
            }
          />
          <Dropdown
            search
            selection
            clearable
            placeholder="Select an account"
            options={keyringOptions}
            onChange={(_, dropdown) => {
              onChange(dropdown.value);
            }}
            value={acctAddr(currentAccount)}
          />
          <BalanceAnnotation />
        </Menu.Menu>
      </Container>
    </Menu>
  );
}

function BalanceAnnotation(props: any) {
  const { api, currentAccount } = useSubstrateState();
  const [accountBalance, setAccountBalance] = useState(0);

  // When account address changes, update subscriptions
  useEffect(() => {
    let unsubscribe: any;

    // If the user has selected an address, create a new subscription
    currentAccount &&
      api.query.system
        .account(acctAddr(currentAccount), (balance: any) =>
          setAccountBalance(balance.data.free.toHuman())
        )
        .then((unsub: any) => (unsubscribe = unsub))
        .catch(console.error);

    return () => unsubscribe && unsubscribe();
  }, [api, currentAccount]);

  return currentAccount ? (
    <Label pointing="left">
      <Icon name="money" color="green" />
      {accountBalance}
    </Label>
  ) : null;
}

export default function AccountSelector(props: any) {
  const { api, keyring } = useSubstrateState();
  return keyring?.getPairs && api.query ? <Main {...props} /> : null;
}
