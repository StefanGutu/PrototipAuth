import express from 'express';
import crypto from 'crypto';
import cors from 'cors';
import { server } from '@passwordless-id/webauthn';
import { client, gql } from './apolloClient.js';
import { INSERT_NEW_USER_CREDENTIAL,INSERT_NEW_USER_DATA} from './graphql/mutations.js';
import {GET_USER_CREDENTIAL} from './graphql/queries.js';

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

const expected = {
    challenge: "",
    origin: "http://localhost:5173",
};



app.post('/api/generate-challenge', (req, res) => {
    const challenge = generateBase64UrlEncodedString();
    expected.challenge = challenge;
    res.json({ challenge });
});

function generateBase64UrlEncodedString() {
    const randomString = crypto.randomBytes(32).toString('hex');
    const base64String = Buffer.from(randomString).toString('base64');
    const base64UrlString = base64String.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return base64UrlString;
}

app.post('/api/generate-ID', (req, res) => {
    const id = crypto.randomUUID();
    res.json({ id });
});

app.post('/api/register-user', async (req, res) => {
    const registrationData = req.body.registrationData;
    console.log('Received registration data:', registrationData);
    
    try {
        // Verify registration data
        const registrationParsed = await server.verifyRegistration(registrationData, expected);
        console.log('Parsed registration data:', registrationParsed);

        // Variables for inserting user data
        const userVariables = {
            userid: registrationParsed.user.id || '',
            username: registrationParsed.user.name || '',
            userdisplayname: registrationParsed.user.name  || '',
        };

        // Insert user data
        try {
            const userResponse = await client.request(INSERT_NEW_USER_DATA, userVariables);
            console.log('User data inserted:', userResponse);
        } catch (userError) {
            console.error('Error inserting user data:', userError.message);
        }


        // Variables for inserting user credentials
        const credentialVariables = {
            credentialid: registrationParsed.credential.id || '',
            userid: registrationParsed.user.id || '',
            pubkey: registrationParsed.credential.publicKey || '',
            algorithm: registrationParsed.credential.algorithm || '',
            transports: registrationParsed.credential.transports || [],
        };

        // Insert user credentials
        try {
            const credentialResponse = await client.request(INSERT_NEW_USER_CREDENTIAL, credentialVariables);
            console.log('User credentials inserted:', credentialResponse);
        } catch (credentialError) {
            console.error('Error inserting user credentials:', credentialError.message);
        }

        // Respond with success message
        res.json({ message: 'Registration data verified', registrationParsed });
    } catch (error) {
        console.error('Error verifying registration:', error.message);
        console.error('Detailed error:', error);
        res.status(500).json({ error: 'Error verifying registration' });
    }
});

app.post('/api/authentication-user', async (req,res) =>{

    const authenticationData = req.body.authenticationData;
    console.log('Recived authentication data', authenticationData);

    try{
        const {credentialKey} = await client.query({
            query: GET_USER_CREDENTIAL,
            variables: authenticationData.id, 
        });
        console.log('CredentialKey recived:',credentialKey);


        try{
            const authenticationParsed = await server.verifyAuthentication(authenticationData, credentialKey, expected);
            console.log('Verification for authenticationParsed',authenticationParsed);
        }catch(authenticationError){
            console.error('Error inserting user credentials:', authenticationError.message);
        }

        

    }catch(error){
        console.error('Error inserting user credentials:', error.message);
    }
});



app.get('/api/get-challenge', (req, res) => {
    res.json({ challenge: expected.challenge });
});

app.get('/', (req, res) => {
    res.send('Welcome to the server!');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
