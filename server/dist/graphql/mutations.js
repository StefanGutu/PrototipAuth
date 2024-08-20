"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INSERT_NEW_USER_CREDENTIAL = void 0;
const core_1 = require("@apollo/client/core");
const INSERT_NEW_USER_CREDENTIAL = (0, core_1.gql) `
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
exports.INSERT_NEW_USER_CREDENTIAL = INSERT_NEW_USER_CREDENTIAL;
