import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client/core';

const client = new ApolloClient({
  link: new HttpLink({
    uri: 'http://hasura:8080/v1/graphql',
    headers: {
      'x-hasura-admin-secret': '1111',
    },
  }),
  cache: new InMemoryCache(),
});

export default client;