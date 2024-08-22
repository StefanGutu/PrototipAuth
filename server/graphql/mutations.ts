import {gql} from '@apollo/client/core';

const INSERT_NEW_USER_CREDENTIAL = gql`
    mutation InsertNewUserCredential(
        $id: String!,
        $pubkey: String!,
        $algorithm: String!,
        $transports: [String!]!,
        $userid: String!,
    ){
        insert_usercredential(
            objects:{
                id: $id,
                pubkey: $pubkey,
                algorithm: $algorithm,
                transports: $transports,
                userid: $userid
            }
        ){
            affected_rows
            returning{
                id
                pubkey
                algorithm
                transports
                userid
            }
        }
    }
`;

const INSERT_NEW_USER_DATA = gql`
    mutation InsertNewUserData(
        $username: String!,
        $userpassword: String!,
        $userid: String!,
    ){
        insert_userdata(
            objects:{
                username: $username,
                userpassword: $userpassword,
                userid: $userid,
            }
        ){
            affected_rows
            returning{
                username
                userpassword
                userid
            }
        }
    }
`;

export{
    INSERT_NEW_USER_CREDENTIAL,
    INSERT_NEW_USER_DATA,
};