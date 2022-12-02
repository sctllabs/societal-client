import React, { useEffect, useState } from "react";
import {
  Table,
  Grid,
  Label,
  Modal,
  Button,
  Form,
  Input
} from "semantic-ui-react";
import { useSubstrateState } from "context/SubstrateContext";
import { TxButton } from "example-components/substrate/TxButton";

const argIsOptional = (arg: any) => arg.type.toString().startsWith("Option<");

export default function Daos(props: any) {
  const { api, keyring, apiState } = useSubstrateState();
  const accounts = keyring?.getPairs();

  const [showModal, setShowModal] = useState(false);
  const [showAddTreasuryProposalModal, setShowAddTreasuryProposalModal] =
    useState(false);

  const [status, setStatus] = useState<any>(null);
  const [daos, setDaos] = useState<any>([]);
  const [daoBalances, setDaoBalances] = useState<any>([]);
  const [daoTreasuryProposals, setDaoTreasuryProposals] = useState<any>([]);
  const [, setPalletRPCs] = useState<any>([]);
  const [selectedPallet, setSelectedPallet] = useState<any>({});
  const [, setCallables] = useState<any>([]);
  const [selectedCallable, setSelectedCallable] = useState<any>({});
  const [paramFields, setParamFields] = useState<any>([]);

  const [daoCreated, setDaoCreated] = useState<any>({});

  const initFormState = {
    palletRpc: "",
    callable: "",
    inputParams: []
  };

  const [formState, setFormState] = useState<any>(initFormState);
  const { palletRpc, callable, inputParams } = formState;

  useEffect(() => {
    let unsubscribeAll: any = null;

    api?.query.dao?.daos
      .entries()
      .then((daos: any) =>
        setDaos(
          daos.map(([id, dao]: any) => ({
            id: id.toHuman()?.[0],
            dao: dao.toHuman()
          }))
        )
      )
      // TODO: ?
      .then((unsub: any) => {
        unsubscribeAll = unsub;
      })
      .catch(console.error);

    return () => unsubscribeAll && unsubscribeAll();
  }, [api, keyring, setDaos, daoCreated]);

  useEffect(() => {
    let unsubscribeAll: any = null;

    const addresses = daos.map(({ dao: { accountId } }: any) => accountId);

    api?.query.system?.account
      .multi(addresses, (balances: any) => {
        const balancesMap = addresses.reduce(
          (acc: any, address: any, index: any) => ({
            ...acc,
            [address]: balances[index].data.free.toHuman()
          }),
          {}
        );
        setDaoBalances(balancesMap);
      })
      .then((unsub: any) => {
        unsubscribeAll = unsub;
      })
      .catch(console.error);

    return () => unsubscribeAll && unsubscribeAll();
  }, [api, daos, setDaoBalances]);

  useEffect(() => {
    api?.query.daoTreasury?.proposals
      .entries()
      .then((proposals: any) => {
        const daoTreasuryMap: any = {};

        proposals.map(([, option]: any) => {
          const proposal = option.toHuman();
          const { daoId } = proposal;

          daoTreasuryMap[`${daoId}`] = !daoTreasuryMap[daoId]
            ? [proposal]
            : [...daoTreasuryMap[daoId], proposal];
        });

        setDaoTreasuryProposals(daoTreasuryMap);

        return proposals;
      })
      .catch(console.error);
  }, [api, daos, setDaoTreasuryProposals]);

  useEffect(() => {
    if (apiState !== "READY") {
      return;
    }
    const palletRPCs = Object.keys(api.tx)
      .sort()
      .filter((pr) => Object.keys(api.tx[pr]).length > 0)
      .map((pr) => ({ key: pr, value: pr, text: pr }));

    setPalletRPCs(palletRPCs);

    setSelectedPallet(palletRPCs.find((pallet: any) => pallet.key === "dao"));
  }, [api, setPalletRPCs, setSelectedPallet]);

  useEffect(() => {
    if (!selectedPallet?.key) {
      return;
    }

    const callables = Object.keys(api.tx[selectedPallet.key])
      .sort()
      .map((c) => ({ key: c, value: c, text: c }));

    setCallables(callables);

    setSelectedCallable(callables.find(({ key }: any) => key === "createDao"));
  }, [api, selectedPallet, setCallables, setSelectedCallable]);

  useEffect(() => {
    if (!selectedPallet.key || !selectedCallable?.key) {
      return;
    }

    const metaArgs = api.tx[selectedPallet.key][selectedCallable.key].meta.args;

    if (!metaArgs || !metaArgs.length) {
      return;
    }

    setParamFields(
      metaArgs.map((arg: any) => ({
        name: arg.name.toString(),
        type: arg.type.toString(),
        optional: argIsOptional(arg)
      }))
    );
  }, [api, selectedPallet, selectedCallable, setParamFields]);

  useEffect(() => {
    if (!selectedPallet.key || !selectedCallable?.key || !paramFields.length) {
      return;
    }

    setFormState({
      ...formState,
      palletRpc: selectedPallet.key,
      callable: selectedCallable.key
    });
  }, [api, paramFields, setFormState]);

  useEffect(() => {
    if (!status) {
      return;
    }

    if (status.includes("Finalized")) {
      setDaoCreated({});

      setShowModal(false);

      setFormState(initFormState);

      setStatus(null);
    }
  }, [status, setDaoCreated]);

  const onPalletCallableParamChange = (_: any, data: any) => {
    setFormState((formState: any) => {
      let res;
      const { state, value } = data;

      if (typeof state === "object") {
        // Input parameter updated
        const {
          ind,
          paramField: { type }
        } = state;
        const inputParams = [...formState.inputParams];
        inputParams[ind] = { type, value };
        res = { ...formState, inputParams };
      }

      return res;
    });
  };

  return (
    <Grid.Column>
      <h1>DAOs</h1>

      <Grid.Column>
        <Button onClick={(_) => setShowModal(true)}>Create DAO</Button>
        <Modal
          open={showModal}
          closeIcon={true}
          onClose={(_) => setShowModal(false)}
        >
          <Modal.Header>Create DAO</Modal.Header>
          <Modal.Content scrolling>
            <Form>
              {paramFields.map((paramField: any, ind: any) => (
                <Form.Field key={`${paramField.name}-${paramField.type}`}>
                  <Input
                    placeholder={paramField.type}
                    type="text"
                    label={paramField.name}
                    state={{ ind, paramField }}
                    value={inputParams[ind] ? inputParams[ind].value : ""}
                    onChange={onPalletCallableParamChange}
                  />
                  {paramField.optional ? (
                    <Label
                      basic
                      pointing
                      color="teal"
                      content="Optional Parameter"
                    />
                  ) : null}
                </Form.Field>
              ))}
              <Form.Field style={{ textAlign: "center" }}>
                <TxButton
                  setStatus={setStatus}
                  label="Create"
                  type="SIGNED-TX"
                  color="blue"
                  attrs={{
                    palletRpc,
                    callable,
                    inputParams,
                    paramFields
                  }}
                />
              </Form.Field>
              <div style={{ overflowWrap: "break-word" }}>{status}</div>
            </Form>
          </Modal.Content>
        </Modal>
      </Grid.Column>

      {daos.length === 0 ? (
        <Label basic color="yellow">
          No DAOs to be shown
        </Label>
      ) : (
        <Table celled striped size="small">
          <Table.Body>
            <Table.Row>
              <Table.Cell width={2} textAlign="right">
                <strong>Name</strong>
              </Table.Cell>
              <Table.Cell width={2}>
                <strong>Purpose</strong>
              </Table.Cell>
              <Table.Cell width={2}>
                <strong>Founder</strong>
              </Table.Cell>
              <Table.Cell width={2}>
                <strong>Balance</strong>
              </Table.Cell>
              <Table.Cell width={2}>
                <strong>Treasury Proposals</strong>
              </Table.Cell>
            </Table.Row>
            {daos?.map(({ id, dao }: any) => (
              <Table.Row key={id}>
                <Table.Cell width={2} textAlign="right">
                  {dao.config.name}
                </Table.Cell>
                <Table.Cell width={2} textAlign="right">
                  {dao.config.purpose}
                </Table.Cell>
                <Table.Cell width={2}>
                  <span style={{ display: "inline-block", minWidth: "31em" }}>
                    {
                      accounts.find(
                        (account: any) => account.address === dao.founder
                      )?.meta.name
                    }
                  </span>
                </Table.Cell>
                <Table.Cell width={2}>
                  <span style={{ display: "inline-block", minWidth: "31em" }}>
                    {daoBalances[dao.accountId]}
                  </span>
                </Table.Cell>
                <Table.Cell width={2}>
                  <span style={{ display: "inline-block", minWidth: "31em" }}>
                    {daoTreasuryProposals[id]?.length}
                    <Button
                      floated="right"
                      onClick={(_) => setShowAddTreasuryProposalModal(true)}
                      color={"green"}
                    >
                      +
                    </Button>
                  </span>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
      <Modal
        open={showAddTreasuryProposalModal}
        closeIcon={true}
        onClose={(_) => setShowAddTreasuryProposalModal(false)}
      >
        <Modal.Header>Submit Treasury Proposal</Modal.Header>
        <Modal.Content scrolling>
          <Form>
            {paramFields.map((paramField: any, ind: number) => (
              <Form.Field key={`${paramField.name}-${paramField.type}`}>
                <Input
                  placeholder={paramField.type}
                  type="text"
                  label={paramField.name}
                  state={{ ind, paramField }}
                  value={inputParams[ind] ? inputParams[ind].value : ""}
                  onChange={onPalletCallableParamChange}
                />
                {paramField.optional ? (
                  <Label
                    basic
                    pointing
                    color="teal"
                    content="Optional Parameter"
                  />
                ) : null}
              </Form.Field>
            ))}
            <Form.Field style={{ textAlign: "center" }}>
              <TxButton
                setStatus={setStatus}
                label="Create"
                type="SIGNED-TX"
                color="blue"
                attrs={{
                  palletRpc,
                  callable,
                  inputParams,
                  paramFields
                }}
              />
            </Form.Field>
            <div style={{ overflowWrap: "break-word" }}>{status}</div>
          </Form>
        </Modal.Content>
      </Modal>
    </Grid.Column>
  );
}
