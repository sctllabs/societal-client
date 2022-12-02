import React, { useEffect, useState } from "react";
import { Form, Input, Grid, Card, Statistic } from "semantic-ui-react";

import { useSubstrateState } from "context/SubstrateContext";
import { TxButton } from "example-components/substrate/TxButton";

function Main(props: any) {
  const { api } = useSubstrateState();

  // The transaction submission status
  const [status, setStatus] = useState<any>("");

  // The currently stored value
  const [currentValue, setCurrentValue] = useState<any>(0);
  const [formValue, setFormValue] = useState<any>(0);

  useEffect(() => {
    let unsubscribe: any;
    api?.query.templateModule
      .something((newValue: any) => {
        // The storage value is an Option<u32>
        // So we have to check whether it is None first
        // There is also unwrapOr
        if (newValue.isNone) {
          setCurrentValue("<None>");
        } else {
          setCurrentValue(newValue.unwrap().toNumber());
        }
      })
      .then((unsub: any) => {
        unsubscribe = unsub;
      })
      .catch(console.error);

    return () => unsubscribe && unsubscribe();
  }, [api.query.templateModule]);

  return (
    <Grid.Column width={8}>
      <h1>Template Module</h1>
      <Card centered>
        <Card.Content textAlign="center">
          <Statistic label="Current Value" value={currentValue} />
        </Card.Content>
      </Card>
      <Form>
        <Form.Field>
          <Input
            label="New Value"
            state="newValue"
            type="number"
            onChange={(_, { value }) => setFormValue(value)}
          />
        </Form.Field>
        <Form.Field style={{ textAlign: "center" }}>
          <TxButton
            label="Store Something"
            type="SIGNED-TX"
            setStatus={setStatus}
            attrs={{
              palletRpc: "templateModule",
              callable: "doSomething",
              inputParams: [formValue],
              paramFields: [true]
            }}
          />
        </Form.Field>
        <div style={{ overflowWrap: "break-word" }}>{status}</div>
      </Form>
    </Grid.Column>
  );
}

export default function TemplateModule(props: any) {
  const { api, apiState } = useSubstrateState();
  return apiState === "READY" &&
    api.query.templateModule &&
    api.query.templateModule.something ? (
    <Main {...props} />
  ) : null;
}
