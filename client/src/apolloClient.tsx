import { ApolloClient, InMemoryCache, ApolloProvider, HttpLink, split } from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import React, { ReactNode } from 'react';



const httpLink = new HttpLink({ // connect ApolloClient with GraphQL server over http
    uri: 'http://localhost:8080/v1/graphql',
    headers: {
      "x-hasura-admin-secret": "1111",  //default password
    },
});


const wsLink = new WebSocketLink({//create WebSocket link for ApolloClient to communicate in real-time with GraphQl
    uri: `ws://localhost:8080/v1/graphql`,
    options: {
      reconnect: true,
      connectionParams: {
        headers: {
          "x-hasura-admin-secret": "1111",  //default password
        },
      },
    },
});



// Use split to direct operations to the appropriate link
const splitLink = split(
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


// Create the Apollo Client
const client = new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache(),
});
  
// Define props interface
interface ApolloWrapperProps {
    children: ReactNode; // Type for children
}
  
// Function to wrap its children, making the client available to all components
const ApolloWrapper: React.FC<ApolloWrapperProps> = ({ children }) => (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
);
  
export default ApolloWrapper;
  