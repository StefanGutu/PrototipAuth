import express from 'express';
import cors from 'cors';
import * as crypto from 'crypto';
import { server } from '@passwordless-id/webauthn';
import  client  from './apollo-Client';
import { INSERT_NEW_USER_CREDENTIAL, INSERT_NEW_USER_DATA } from './graphql/mutations';
import {GET_USER_CREDENTIAL, GET_USER_DATA} from './graphql/queries';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

(global as any).crypto = crypto;

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());



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
    console.log("Challenge:", typeof base64UrlString , base64UrlString);
    return base64UrlString;
}


// Function that generate random ID for user
app.post('/api/generate-ID', (req, res) => {
    const id = crypto.randomUUID();
    res.json({ id });
});


//This function recive data when the client register for the first time and send it to data base
app.post('/api/register-user', async (req , res) =>{  
    const registrationData  = req.body.registrationData;
    console.log("-----------------------------------------------------------");
    console.log("Recived user data for registration:",registrationData);
    console.log("-----------------------------------------------------------");

    try{

        const newRegistrationData = { // struct that will be sent to database
            username: registrationData.UserName,
            userpassword: registrationData.UserPassword,
            userid: registrationData.UserID
        }

        try{

            const credentialResponse = await client.mutate({ 
                mutation: INSERT_NEW_USER_DATA,
                variables: newRegistrationData,
            });

            userDataForToken.userid = newRegistrationData.userid;
            userDataForToken.username = newRegistrationData.username

            console.log('----------------------------------------------------------------');
            console.log('User data inserted with success:', credentialResponse);

            const token: string = jwt.sign(userDataForToken,secretKey,{expiresIn:'1h'});

            res.json({token});

        }catch(error){
            console.log('Error inserting user data: ',error);
            throw error;
        }

    }catch(error){
        console.log('Error getting hashed password in register-user ',error);
        throw error;
    }

});

const validateUser = async (req:Request, res: Response, next:NextFunction) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const auth = authHeader.split(' ')[1];
        const [username, password] = Buffer.from(auth, 'base64').toString().split(':'); // Extrage username și password din header

        try {
            const userDataFromDataBase = await client.query({
                query: GET_USER_DATA,
                variables: { username: username },
            });

            if (userDataFromDataBase.data.userdata.length === 0) {
                return res.json(false);
            }

            if (password === userDataFromDataBase.data.userdata[0].userpassword) {
                
                userDataForToken.userid = userDataFromDataBase.data.userdata[0].userid;
                userDataForToken.username = userDataFromDataBase.data.userdata[0].username;

                return next();
            } else {
                return res.json(false);
            }
        } catch (error) {
            console.log('Error during user validation: ', error);
            return res.status(500).send('Internal Server Error');
        }
    } else {
        return res.status(401).json('Authentication required');
    }
};

app.post('/api/authentication-user', validateUser, async (req, res) => {
    try {
        console.log('User authenticated successfully.');

        const token: string = jwt.sign(userDataForToken,secretKey,{expiresIn:'1h'});

        const dataBack = {
            userid: userDataForToken.userid,
            token: token,
        };

        res.json({dataBack});
    } catch (error) {
        console.log('Error during the authentication process: ', error);
        return res.json(false);
    }
});


//--------------------------------------------------------------------------------------------------------------------------------------------
app.post('/api/register-user-credetial', async (req, res) => {
    const registrationData = req.body.registrationData;
    console.log('Received registration data:', registrationData);
    
    try {
        // Verify registration data
        const registrationParsed = await server.verifyRegistration(registrationData, expected);//also its checking challanges
        console.log('----------------------------------------------------------------');
        console.log('Verified registration data:', registrationParsed);

        try{
            //Search for the user in database and get data to add id to credetials that will be saved
            const userDataFromDataBase = await client.query({
                query: GET_USER_DATA,
                variables: { username: registrationParsed.user.name},
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
    
                const credentialResponse = await client.mutate({
                    mutation: INSERT_NEW_USER_CREDENTIAL,
                    variables: credentialVariables,
                });
    
    
                console.log('----------------------------------------------------------------');
                console.log('User credentials inserted:', credentialResponse);
                res.json(true);
            } catch (credentialError) {
                console.error('Error inserting user credentials:', credentialError);
                throw credentialError;
            }



        }catch(error){
            console.log("Error getting userdata from database:",error);
            throw error;
        }

    } catch (error) {
        console.error('Error verifying registration:', error);
        console.error('Detailed error:', error);
        res.status(500).json({ error: 'Error verifying registration' });
    }
});


app.post('/api/authentication-user-credetial', async (req,res) =>{

    const authenticationData = req.body.authenticationData;
    console.log('----------------------------------------------------------------');
    console.log('Recived authentication data', authenticationData);

    try{

        const userData = await client.query({//get userdata if exists in database
            query: GET_USER_DATA,
            variables: {username: authenticationData.username},
        });

        try{

            const result = await client.query({ //Get credential from database with the user id
                query: GET_USER_CREDENTIAL,
                variables: { userid: userData.data.userdata[0].userid},
            });
    
    
            const tempCredential = result.data.usercredential[0];
            
            const credential  = { // credential data that will be send to verifyAuthentication
                id: tempCredential.id,
                publicKey: tempCredential.pubkey,
                algorithm: tempCredential.algorithm,
                transports: tempCredential.transports
            };
    
                   
            if (authenticationData && credential && expected) {

                try {

                    const authenticationParsed = await server.verifyAuthentication(authenticationData.authentication, credential, expected);
    
                    console.log('Verification result:', authenticationParsed);

                    userDataForToken.userid = userData.data.userdata[0].userid;
                    userDataForToken.username =  userData.data.userdata[0].username;


                    const token: string = jwt.sign(userDataForToken,secretKey,{expiresIn:'1h'});

                    const dataBack = {
                        userid: userDataForToken.userid,
                        token: token,
                    };
            
                    res.json({dataBack});

                } catch (error) {
                    console.error('Detailed error:', error);
                }

            } else {
                console.error('One or more parameters are undefined:', {
                    authenticationData,
                    credential,
                    expected
                });
            }
    
        }catch(error){
            console.log('Credetial doesnt exist for this user',error);
            res.json(false);
        };

    }catch(error){
        console.log('User doesnt exist');
        res.json(false);
    };
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