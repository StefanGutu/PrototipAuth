"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET_USER_DATA = exports.GET_USER_CREDENTIAL = void 0;
const core_1 = require("@apollo/client/core");
const GET_USER_CREDENTIAL = (0, core_1.gql) `
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
exports.GET_USER_CREDENTIAL = GET_USER_CREDENTIAL;
const GET_USER_DATA = (0, core_1.gql) `
    query getUserData($username : String!){
        userdata(where: {username: {_eq: $username}}){
            username
            userpassword
            userid
        }
    }
`;
exports.GET_USER_DATA = GET_USER_DATA;
