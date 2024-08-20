"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const crypto_1 = __importDefault(require("crypto"));
const cors_1 = __importDefault(require("cors"));
const webauthn_1 = require("@passwordless-id/webauthn");
const apollo_Client_1 = __importDefault(require("./apollo-Client"));
const mutations_1 = require("./graphql/mutations");
const queries_1 = require("./graphql/queries");
const app = (0, express_1.default)();
const port = 3000;
app.use(express_1.default.json());
app.use((0, cors_1.default)());
const expected = {
    challenge: "",
    origin: "http://localhost:5173",
    userVerified: false,
    verbose: false,
};
app.post('/api/generate-challenge', (req, res) => {
    const challenge = generateBase64UrlEncodedString(); // get the random string
    expected.challenge = challenge;
    res.json({ challenge }); //send it back
});
//Function to generate random string for challenge
function generateBase64UrlEncodedString() {
    const randomString = crypto_1.default.randomBytes(32).toString('hex');
    const base64String = Buffer.from(randomString).toString('base64');
    const base64UrlString = base64String.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    console.log("Challenge:", typeof base64UrlString, base64UrlString);
    return base64UrlString;
}
// Function that generate random ID for user
app.post('/api/generate-ID', (req, res) => {
    const id = crypto_1.default.randomUUID();
    res.json({ id });
});
app.post('/api/register-user', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const registrationData = req.body.registrationData;
    console.log('Received registration data:', registrationData);
    try {
        // Verify registration data
        const registrationParsed = yield webauthn_1.server.verifyRegistration(registrationData, expected); //also its checking challanges
        console.log('----------------------------------------------------------------');
        console.log('Verified registration data:', registrationParsed);
        // Variables for inserting user credentials
        const credentialVariables = {
            id: registrationParsed.credential.id || '',
            pubkey: registrationParsed.credential.publicKey || '',
            algorithm: registrationParsed.credential.algorithm || '',
            transports: registrationParsed.credential.transports || [],
        };
        // Insert user credentials
        try {
            const credentialResponse = yield apollo_Client_1.default.mutate({
                mutation: mutations_1.INSERT_NEW_USER_CREDENTIAL,
                variables: credentialVariables,
            });
            console.log('----------------------------------------------------------------');
            console.log('User credentials inserted:', credentialResponse);
            res.json('true');
        }
        catch (credentialError) {
            console.error('Error inserting user credentials:', credentialError);
            res.json('false');
        }
    }
    catch (error) {
        console.error('Error verifying registration:', error);
        console.error('Detailed error:', error);
        res.status(500).json({ error: 'Error verifying registration' });
    }
}));
app.post('/api/authentication-user', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authenticationData = req.body.authenticationData;
    console.log('----------------------------------------------------------------');
    console.log('Recived authentication data', authenticationData);
    try {
        const result = yield apollo_Client_1.default.query({
            query: queries_1.GET_USER_CREDENTIAL,
            variables: { id: authenticationData.id },
        });
        const credential = result.data.usercredential[0];
        const secondCredential = {
            id: credential.id,
            publicKey: credential.pubkey,
            algorithm: credential.algorithm,
            transports: credential.transports
        };
        if (credential && credential.id) {
            // console.log('----------------------------------------------------------------');
            // console.log('Credential recived from database:', credential);
            // console.log('----------------------------------------------------------------');
            // console.log('Expected shown: ',expected);
            // console.log('----------------------------------------------------------------');
            // console.log("Expected:", typeof expected);
            // console.log("credential:", typeof credential.id);
            // console.log("Authentication:", typeof authenticationData.id);
            console.log('----------------------------------------------------------------');
            console.log("Expected Challenge:", typeof expected.challenge, expected.challenge);
            console.log("Expected Origin:", typeof expected.origin, expected.origin);
            console.log("Expected User Verified:", typeof expected.userVerified, expected.userVerified);
            console.log("Expected Verbose:", typeof expected.verbose, expected.verbose);
            console.log('----------------------------------------------------------------');
            console.log("Credential ID:", typeof credential.id, credential.id);
            console.log("Credential PublicKey:", typeof credential.pubkey, credential.pubkey);
            console.log("Credential Algorithm:", typeof credential.algorithm, credential.algorithm);
            console.log("Credential Transports:", typeof credential.transports[0], credential.transports);
            console.log('----------------------------------------------------------------');
            console.log("Authentication Data ID:", typeof authenticationData.id, authenticationData.id);
            console.log("Authentication Data Raw ID:", typeof authenticationData.rawId, authenticationData.rawId);
            console.log("Authentication Data Type:", typeof authenticationData.type, authenticationData.type);
            console.log("Authentication Data Response authenticatorData:", typeof authenticationData.response.authenticatorData, authenticationData.response.authenticatorData);
            console.log("Authentication Data Response clientDataJSON:", typeof authenticationData.response.clientDataJSON, authenticationData.response.clientDataJSON);
            console.log("Authentication Data Response signature:", typeof authenticationData.response.signature, authenticationData.response.signature);
            console.log("Authentication Data Response userHandle:", typeof authenticationData.response.userHandle, authenticationData.response.userHandle);
            console.log('----------------------------------------------------------------');
            if (authenticationData && credential && expected) {
                try {
                    const authenticationParsed = yield webauthn_1.server.verifyAuthentication(authenticationData, secondCredential, expected);
                    console.log('Verification result:', authenticationParsed);
                }
                catch (error) {
                    console.error('Detailed error:', error);
                }
            }
            else {
                console.error('One or more parameters are undefined:', {
                    authenticationData,
                    credential,
                    expected
                });
            }
            res.json('true');
        }
        else {
            console.log('No credentials found for the given ID.');
            res.json('false');
        }
    }
    catch (error) {
        console.error('Error inserting user credentials authentication:', error);
    }
}));
app.get('/api/get-challenge', (req, res) => {
    res.json({ challenge: expected.challenge });
});
app.get('/', (req, res) => {
    res.send('Welcome to the server!');
});
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
