import React, { useEffect, useState } from "react";
import { Card, Icon, Grid } from "semantic-ui-react";

import { useSubstrateState } from "context/SubstrateContext";

type NodeInfo = {
  nodeName: string;
  chain: string;
  nodeVersion: string;
};

function Main(props: any) {
  const { api, socket } = useSubstrateState();
  const [nodeInfo, setNodeInfo] = useState<NodeInfo>({
    nodeName: "test",
    chain: "test",
    nodeVersion: "test"
  });

  useEffect(() => {
    const getInfo = async () => {
      try {
        const [chain, nodeName, nodeVersion] = await Promise.all([
          api.rpc.system.chain(),
          api.rpc.system.name(),
          api.rpc.system.version()
        ]);
        setNodeInfo({ chain, nodeName, nodeVersion });
      } catch (e) {
        console.error(e);
      }
    };
    getInfo();
  }, [api.rpc.system]);

  return (
    <Grid.Column>
      <Card>
        <Card.Content>
          <Card.Header>{nodeInfo.nodeName}</Card.Header>
          <Card.Meta>
            <span>{nodeInfo.chain}</span>
          </Card.Meta>
          <Card.Description>{socket}</Card.Description>
        </Card.Content>
        <Card.Content extra>
          <Icon name="setting" />v{nodeInfo.nodeVersion}
        </Card.Content>
      </Card>
    </Grid.Column>
  );
}

export default function NodeInfo(props: any) {
  const { api, apiState } = useSubstrateState();
  return apiState === "READY" &&
    api.rpc &&
    api.rpc.system &&
    api.rpc.system.chain &&
    api.rpc.system.name &&
    api.rpc.system.version ? (
    <Main {...props} />
  ) : null;
}
