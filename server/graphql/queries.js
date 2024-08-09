import { gql } from '../apolloClient.js';


const GET_USER_CREDENTIAL = gql`
  query GetUserCredential($credentialid: String!) {
    usercredential(where: { credentialid: { _eq: $credentialid } }) {
      algorithm
      credentialid
      pubkey
      transports
    }
  }
`;

export{
  GET_USER_CREDENTIAL,
}