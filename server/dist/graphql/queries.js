"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET_USER_CREDENTIAL = void 0;
const core_1 = require("@apollo/client/core");
const GET_USER_CREDENTIAL = (0, core_1.gql) `
    query getUserCredential($id : String!){
        usercredential(where: {id: {_eq: $id}}){
            id
            pubkey
            algorithm
            transports
        }
    }
`;
exports.GET_USER_CREDENTIAL = GET_USER_CREDENTIAL;
