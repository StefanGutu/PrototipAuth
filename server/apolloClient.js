import { GraphQLClient, gql } from 'graphql-request';

const client = new GraphQLClient('http://hasura:8080/v1/graphql', {
  headers: {
    'x-hasura-admin-secret': '1111',
  },
});

export { client, gql };