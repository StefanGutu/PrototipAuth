"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INSERT_NEW_USER_DATA = exports.INSERT_NEW_USER_CREDENTIAL = void 0;
const core_1 = require("@apollo/client/core");
const INSERT_NEW_USER_CREDENTIAL = (0, core_1.gql) `
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
exports.INSERT_NEW_USER_CREDENTIAL = INSERT_NEW_USER_CREDENTIAL;
const INSERT_NEW_USER_DATA = (0, core_1.gql) `
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
exports.INSERT_NEW_USER_DATA = INSERT_NEW_USER_DATA;
