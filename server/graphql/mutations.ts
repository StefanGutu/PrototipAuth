import {gql} from '@apollo/client/core';

const INSERT_NEW_USER_CREDENTIAL = gql`
    mutation InsertNewUserCredential(
        $id: String!,
        $pubkey: String!,
        $algorithm: String!,
        $transports: [String!]!,
    ){
        insert_usercredential(
            objects:{
                id: $id,
                pubkey: $pubkey,
                algorithm: $algorithm,
                transports: $transports
            }
        ){
            affected_rows
            returning{
                id
                pubkey
                algorithm
                transports
            }
        }
    }
`;

export{
    INSERT_NEW_USER_CREDENTIAL,
};