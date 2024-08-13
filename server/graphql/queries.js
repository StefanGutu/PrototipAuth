import { gql } from '../apolloClient.js';


const GET_USER_CREDENTIAL = gql`
  query getUserCredential($id: String!) {
    usercredential(where: { id: { _eq: $id } }){
      id
      pubkey
      algorithm
      transports
    }
  }
`;

export{
  GET_USER_CREDENTIAL,
}