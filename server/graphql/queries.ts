import {gql} from '@apollo/client/core';

const GET_USER_CREDENTIAL = gql`
    query getUserCredential($userid : String!){
        usercredential(where: {userid: {_eq: $userid}}){
            id
            pubkey
            algorithm
            transports
            userid
        }
    }
`;

const GET_USER_DATA = gql`
    query getUserData($username : String!){
        userdata(where: {username: {_eq: $username}}){
            username
            userpassword
            userid
        }
    }
`;
 
export{
    GET_USER_CREDENTIAL,
    GET_USER_DATA,
}