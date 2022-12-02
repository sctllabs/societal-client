import React, { useEffect, useState } from "react";
import { Feed, Grid, Button } from "semantic-ui-react";

import { useSubstrateState } from "context/SubstrateContext";

// Events to be filtered from feed
const FILTERED_EVENTS = [
  'system:ExtrinsicSuccess::(phase={"applyExtrinsic":0})'
];

const eventName = (ev: any) => `${ev.section}:${ev.method}`;
const eventParams = (ev: any) => JSON.stringify(ev.data);

function Main(props: any) {
  const { api } = useSubstrateState();
  const [eventFeed, setEventFeed] = useState<any>([]);

  useEffect(() => {
    let unsub: any = null;
    let keyNum = 0;
    const allEvents = async () => {
      unsub = await api?.query.system.events((events: any) => {
        // loop through the Vec<EventRecord>
        events.forEach((record: any) => {
          // extract the phase, event and the event types
          const { event, phase } = record;

          // show what we are busy with
          const evHuman = event.toHuman();
          const evName = eventName(evHuman);
          const evParams = eventParams(evHuman);
          const evNamePhase = `${evName}::(phase=${phase.toString()})`;

          if (FILTERED_EVENTS.includes(evNamePhase)) return;

          setEventFeed((e: any) => [
            {
              key: keyNum,
              icon: "bell",
              summary: evName,
              content: evParams
            },
            ...e
          ]);

          keyNum += 1;
        });
      });
    };

    allEvents();
    return () => unsub && unsub();
  }, [api.query.system]);

  const { feedMaxHeight = 250 } = props;

  return (
    <Grid.Column width={8}>
      <h1 style={{ float: "left" }}>Events</h1>
      <Button
        basic
        circular
        size="mini"
        color="grey"
        floated="right"
        icon="erase"
        onClick={(_) => setEventFeed([])}
      />
      <Feed
        style={{ clear: "both", overflow: "auto", maxHeight: feedMaxHeight }}
        events={eventFeed}
      />
    </Grid.Column>
  );
}

export default function Events(props: any) {
  const { api, apiState } = useSubstrateState();
  return apiState === "READY" &&
    api.query &&
    api.query.system &&
    api.query.system.events ? (
    <Main {...props} />
  ) : null;
}
