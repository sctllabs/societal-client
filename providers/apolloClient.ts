import { ApolloClient, InMemoryCache, split, HttpLink } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { appConfig } from 'config';

function getLink() {
  const httpLink = new HttpLink({
    uri: appConfig.httpApiUri
  });

  if (typeof window === 'undefined') {
    return httpLink;
  }

  const wsLink = new GraphQLWsLink(
    createClient({
      url: appConfig.wsApiUri
    })
  );

  // The split function takes three parameters:
  //
  // * A function that's called for each operation to execute
  // * The Link to use for an operation if the function returns a "truthy" value
  // * The Link to use for an operation if the function returns a "falsy" value
  return split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      );
    },
    wsLink,
    httpLink
  );
}

export const apolloClient = new ApolloClient({
  link: getLink(),
  cache: new InMemoryCache()
});
