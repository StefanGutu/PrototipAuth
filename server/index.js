import express from 'express';
import crypto from 'crypto';
import cors from 'cors';
import { server } from '@passwordless-id/webauthn';
import { client } from './apolloClient.js';
import { INSERT_NEW_USER_CREDENTIAL} from './graphql/mutations.js';
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
    const challenge = generateBase64UrlEncodedString(); // get the random string
    expected.challenge = challenge;
    res.json({ challenge }); //send it back
});


//Function to generate random string for challenge
function generateBase64UrlEncodedString() {
    const randomString = crypto.randomBytes(32).toString('hex');
    const base64String = Buffer.from(randomString).toString('base64');
    const base64UrlString = base64String.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return base64UrlString;
}


// Function that generate random ID for user
app.post('/api/generate-ID', (req, res) => {
    const id = crypto.randomUUID();
    res.json({ id });
});



app.post('/api/register-user', async (req, res) => {
    const registrationData = req.body.registrationData;
    console.log('Received registration data:', registrationData);
    
    try {
        // Verify registration data
        const registrationParsed = await server.verifyRegistration(registrationData, expected);//also its checking challanges
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
            const credentialResponse = await client.request(INSERT_NEW_USER_CREDENTIAL, credentialVariables);
            console.log('----------------------------------------------------------------');
            console.log('User credentials inserted:', credentialResponse);
            res.json('true');
        } catch (credentialError) {
            console.error('Error inserting user credentials:', credentialError.message);
            res.json('false');
        }

    } catch (error) {
        console.error('Error verifying registration:', error.message);
        console.error('Detailed error:', error);
        res.status(500).json({ error: 'Error verifying registration' });
    }
});



app.post('/api/authentication-user', async (req,res) =>{

    const authenticationData = req.body.authenticationData;
    console.log('----------------------------------------------------------------');
    console.log('Recived authentication data', authenticationData);

    try{
        
        const userID = authenticationData.id;
        const sanitizedUserID = userID.trim();
    
        const { usercredential } = await client.request(GET_USER_CREDENTIAL, { id: sanitizedUserID });

        if (usercredential && usercredential.length > 0) { 
            const credential = usercredential[0];
            
            console.log('----------------------------------------------------------------');
            console.log('Credential recived from database:', credential);
            
            

            try { //error (Cannot read properties of undefined (reading 'replaceAll'))
                const authenticationParsed = await server.verifyAuthentication(authenticationData, credential, expected);
                console.log('Verification for authenticationParsed', authenticationParsed);
            } catch (authenticationError) {
                console.error('Error inserting user credentials authenticationParsed:', authenticationError.message);
            }
            res.json('true');
        } else {
            console.log('No credentials found for the given ID.');
            res.json('false');
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
