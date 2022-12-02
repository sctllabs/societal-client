import React, { useEffect, useState } from "react";
import { Statistic, Grid, Card, Icon } from "semantic-ui-react";

import { useSubstrateState } from "context/SubstrateContext";

function Main(props: any) {
  const { api } = useSubstrateState();
  const { finalized } = props;
  const [blockNumber, setBlockNumber] = useState(0);
  const [blockNumberTimer, setBlockNumberTimer] = useState(0);

  const bestNumber = finalized
    ? api.derive.chain.bestNumberFinalized
    : api.derive.chain.bestNumber;

  useEffect(() => {
    let unsubscribeAll: any = null;

    bestNumber((number: any) => {
      // Append `.toLocaleString('en-US')` to display a nice thousand-separated digit.
      setBlockNumber(number.toNumber().toLocaleString("en-US"));
      setBlockNumberTimer(0);
    })
      .then((unsub: any) => {
        unsubscribeAll = unsub;
      })
      .catch(console.error);

    return () => unsubscribeAll && unsubscribeAll();
  }, [bestNumber]);

  const timer = () => {
    setBlockNumberTimer((time) => time + 1);
  };

  useEffect(() => {
    const id = setInterval(timer, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <Grid.Column>
      <Card>
        <Card.Content textAlign="center">
          <Statistic
            className="block_number"
            label={(finalized ? "Finalized" : "Current") + " Block"}
            value={blockNumber}
          />
        </Card.Content>
        <Card.Content extra>
          <Icon name="time" /> {blockNumberTimer}
        </Card.Content>
      </Card>
    </Grid.Column>
  );
}

export default function BlockNumber(props: any) {
  const { api, apiState } = useSubstrateState();
  return apiState === "READY" &&
    api.derive &&
    api.derive.chain &&
    api.derive.chain.bestNumber &&
    api.derive.chain.bestNumberFinalized ? (
    <Main {...props} />
  ) : null;
}
