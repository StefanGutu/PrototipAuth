"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@apollo/client/core");
const client = new core_1.ApolloClient({
    link: new core_1.HttpLink({
        uri: 'http://hasura:8080/v1/graphql',
        headers: {
            'x-hasura-admin-secret': '1111',
        },
    }),
    cache: new core_1.InMemoryCache(),
});
exports.default = client;
