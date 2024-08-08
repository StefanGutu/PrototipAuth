import { gql } from '../apolloClient.js';

const INSERT_NEW_USER_CREDENTIAL = gql`
  mutation InsertNewUserCredential(
    $credentialid: String!,
    $userid: String!
    $pubkey: String!,
    $algorithm: String!,
    $transports: [String!]!,
  ) {
    insert_usercredential(
      objects: {
        credentialid: $credentialid,
        userid: $userid,
        pubkey: $pubkey,
        algorithm: $algorithm,
        transports: $transports
      }
    ) {
      affected_rows
      returning {
        credentialid
        userid
        pubkey
        algorithm
        transports
      }
    }
  }
`;


const INSERT_NEW_USER_DATA = gql`
  mutation InsertNewUserData(
    $userid: String!,
    $username: String!,
    $userdisplayname: String!
  ) {
    insert_userdata(
      objects: {
        userid: $userid,
        username: $username,
        userdisplayname: $userdisplayname
      }
    ) {
      affected_rows
      returning {
        userid
        username
        userdisplayname
      }
    }
  }
`;

export {
    INSERT_NEW_USER_CREDENTIAL,
    INSERT_NEW_USER_DATA,
};
