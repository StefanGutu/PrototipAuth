"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const cors_1 = __importDefault(require("cors"));
const crypto = __importStar(require("crypto"));
const webauthn_1 = require("@passwordless-id/webauthn");
const apollo_Client_1 = __importDefault(require("./apollo-Client"));
const mutations_1 = require("./graphql/mutations");
const queries_1 = require("./graphql/queries");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
global.crypto = crypto;
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
const secretKey = "a-very-very-secret-key";
const userDataForToken = {
    userid: "userid",
    username: "username",
};
app.post('/api/generate-challenge', (req, res) => {
    const challenge = generateBase64UrlEncodedString(); // get the random string
    expected.challenge = challenge;
    res.json({ challenge }); //send it back
});
//Function to generate random string for challenge
function generateBase64UrlEncodedString() {
    const randomString = crypto.randomBytes(32).toString('hex');
    const base64String = Buffer.from(randomString).toString('base64');
    const base64UrlString = base64String.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    console.log("Challenge:", typeof base64UrlString, base64UrlString);
    return base64UrlString;
}
// Function that generate random ID for user
app.post('/api/generate-ID', (req, res) => {
    const id = crypto.randomUUID();
    res.json({ id });
});
//This function recive data when the client register for the first time and send it to data base
app.post('/api/register-user', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const registrationData = req.body.registrationData;
    console.log("-----------------------------------------------------------");
    console.log("Recived user data for registration:", registrationData);
    console.log("-----------------------------------------------------------");
    try {
        const newRegistrationData = {
            username: registrationData.UserName,
            userpassword: registrationData.UserPassword,
            userid: registrationData.UserID
        };
        try {
            const credentialResponse = yield apollo_Client_1.default.mutate({
                mutation: mutations_1.INSERT_NEW_USER_DATA,
                variables: newRegistrationData,
            });
            userDataForToken.userid = newRegistrationData.userid;
            userDataForToken.username = newRegistrationData.username;
            console.log('----------------------------------------------------------------');
            console.log('User data inserted with success:', credentialResponse);
            const token = jsonwebtoken_1.default.sign(userDataForToken, secretKey, { expiresIn: '1h' });
            res.json({ token });
        }
        catch (error) {
            console.log('Error inserting user data: ', error);
            throw error;
        }
    }
    catch (error) {
        console.log('Error getting hashed password in register-user ', error);
        throw error;
    }
}));
const validateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const auth = authHeader.split(' ')[1];
        const [username, password] = Buffer.from(auth, 'base64').toString().split(':'); // Extrage username și password din header
        try {
            const userDataFromDataBase = yield apollo_Client_1.default.query({
                query: queries_1.GET_USER_DATA,
                variables: { username: username },
            });
            if (userDataFromDataBase.data.userdata.length === 0) {
                return res.json(false);
            }
            if (password === userDataFromDataBase.data.userdata[0].userpassword) {
                userDataForToken.userid = userDataFromDataBase.data.userdata[0].userid;
                userDataForToken.username = userDataFromDataBase.data.userdata[0].username;
                return next();
            }
            else {
                return res.json(false);
            }
        }
        catch (error) {
            console.log('Error during user validation: ', error);
            return res.status(500).send('Internal Server Error');
        }
    }
    else {
        return res.status(401).json('Authentication required');
    }
});
app.post('/api/authentication-user', validateUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('User authenticated successfully.');
        const token = jsonwebtoken_1.default.sign(userDataForToken, secretKey, { expiresIn: '1h' });
        const dataBack = {
            userid: userDataForToken.userid,
            token: token,
        };
        res.json({ dataBack });
    }
    catch (error) {
        console.log('Error during the authentication process: ', error);
        return res.json(false);
    }
}));
//--------------------------------------------------------------------------------------------------------------------------------------------
app.post('/api/register-user-credetial', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const registrationData = req.body.registrationData;
    console.log('Received registration data:', registrationData);
    try {
        // Verify registration data
        const registrationParsed = yield webauthn_1.server.verifyRegistration(registrationData, expected); //also its checking challanges
        console.log('----------------------------------------------------------------');
        console.log('Verified registration data:', registrationParsed);
        try {
            //Search for the user in database and get data to add id to credetials that will be saved
            const userDataFromDataBase = yield apollo_Client_1.default.query({
                query: queries_1.GET_USER_DATA,
                variables: { username: registrationParsed.user.name },
            });
            // Variables for inserting user credentials
            const credentialVariables = {
                id: registrationParsed.credential.id || '',
                pubkey: registrationParsed.credential.publicKey || '',
                algorithm: registrationParsed.credential.algorithm || '',
                transports: registrationParsed.credential.transports || [],
                userid: userDataFromDataBase.data.userdata[0].userid || '',
            };
            // Insert user credentials
            try {
                const credentialResponse = yield apollo_Client_1.default.mutate({
                    mutation: mutations_1.INSERT_NEW_USER_CREDENTIAL,
                    variables: credentialVariables,
                });
                console.log('----------------------------------------------------------------');
                console.log('User credentials inserted:', credentialResponse);
                res.json(true);
            }
            catch (credentialError) {
                console.error('Error inserting user credentials:', credentialError);
                throw credentialError;
            }
        }
        catch (error) {
            console.log("Error getting userdata from database:", error);
            throw error;
        }
    }
    catch (error) {
        console.error('Error verifying registration:', error);
        console.error('Detailed error:', error);
        res.status(500).json({ error: 'Error verifying registration' });
    }
}));
app.post('/api/authentication-user-credetial', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authenticationData = req.body.authenticationData;
    console.log('----------------------------------------------------------------');
    console.log('Recived authentication data', authenticationData);
    try {
        const userData = yield apollo_Client_1.default.query({
            query: queries_1.GET_USER_DATA,
            variables: { username: authenticationData.username },
        });
        try {
            const result = yield apollo_Client_1.default.query({
                query: queries_1.GET_USER_CREDENTIAL,
                variables: { userid: userData.data.userdata[0].userid },
            });
            const tempCredential = result.data.usercredential[0];
            const credential = {
                id: tempCredential.id,
                publicKey: tempCredential.pubkey,
                algorithm: tempCredential.algorithm,
                transports: tempCredential.transports
            };
            if (authenticationData && credential && expected) {
                try {
                    const authenticationParsed = yield webauthn_1.server.verifyAuthentication(authenticationData.authentication, credential, expected);
                    console.log('Verification result:', authenticationParsed);
                    userDataForToken.userid = userData.data.userdata[0].userid;
                    userDataForToken.username = userData.data.userdata[0].username;
                    const token = jsonwebtoken_1.default.sign(userDataForToken, secretKey, { expiresIn: '1h' });
                    const dataBack = {
                        userid: userDataForToken.userid,
                        token: token,
                    };
                    res.json({ dataBack });
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
        }
        catch (error) {
            console.log('Credetial doesnt exist for this user', error);
            res.json(false);
        }
        ;
    }
    catch (error) {
        console.log('User doesnt exist');
        res.json(false);
    }
    ;
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
