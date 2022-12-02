import React, { useEffect, useState } from "react";
import { Table, Grid, Button, Label } from "semantic-ui-react";
import { useSubstrateState } from "context/SubstrateContext";

export default function Balances(props: any) {
  const { api, keyring } = useSubstrateState();
  const accounts = keyring?.getPairs();
  const [balances, setBalances] = useState<any>({});

  useEffect(() => {
    const addresses = keyring
      ?.getPairs()
      .map((account: any) => account.address);
    let unsubscribeAll: any = null;

    api?.query.system?.account
      .multi(addresses, (balances: any) => {
        const balancesMap = addresses.reduce(
          (acc: any, address: any, index: any) => ({
            ...acc,
            [address]: balances[index].data.free.toHuman()
          }),
          {}
        );
        setBalances(balancesMap);
      })
      .then((unsub: any) => {
        unsubscribeAll = unsub;
      })
      .catch(console.error);

    return () => unsubscribeAll && unsubscribeAll();
  }, [api, keyring, setBalances]);

  return (
    <Grid.Column>
      <h1>Balances</h1>
      {accounts && accounts.length === 0 ? (
        <Label basic color="yellow">
          No accounts to be shown
        </Label>
      ) : (
        <Table celled striped size="small">
          <Table.Body>
            <Table.Row>
              <Table.Cell width={3} textAlign="right">
                <strong>Name</strong>
              </Table.Cell>
              <Table.Cell width={10}>
                <strong>Address</strong>
              </Table.Cell>
              <Table.Cell width={3}>
                <strong>Balance</strong>
              </Table.Cell>
            </Table.Row>
            {accounts &&
              accounts.map((account: any) => (
                <Table.Row key={account.address}>
                  <Table.Cell width={3} textAlign="right">
                    {account.meta.name}
                  </Table.Cell>
                  <Table.Cell width={10}>
                    <span style={{ display: "inline-block", minWidth: "31em" }}>
                      {account.address}
                    </span>
                    <Button
                      basic
                      circular
                      compact
                      size="mini"
                      color="blue"
                      icon="copy outline"
                      onClick={() =>
                        navigator.clipboard.writeText(account.address)
                      }
                    />
                  </Table.Cell>
                  <Table.Cell width={3}>
                    {balances &&
                      balances[account.address] &&
                      balances[account.address]}
                  </Table.Cell>
                </Table.Row>
              ))}
          </Table.Body>
        </Table>
      )}
    </Grid.Column>
  );
}
