import express from 'express';
import crypto from 'crypto';
import cors from 'cors';
import { server } from '@passwordless-id/webauthn';


const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

const expected = {
    challenge: "",
    origin: "http://localhost:5173",
};



app.post('/api/generate-challenge', (req,res) =>{
    const challenge = generateBase64UrlEncodedString();
    expected.challenge = challenge;
    res.json({challenge});
});



function generateBase64UrlEncodedString() {
    const randomString = crypto.randomBytes(32).toString('hex'); // Generate a random string
    const base64String = Buffer.from(randomString).toString('base64'); // Base64 encode the string
  
    
    const base64UrlString = base64String.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return base64UrlString;
};



app.post('/api/generate-ID',(req,res) => {
    const id = crypto.randomUUID();
    res.json({id});
});


app.post('/api/register-user',async (req,res) => {
    const registrationData = req.body.registrationData;
    
    try{
        const registrationParsed = await server.verifyRegistration(registrationData,expected);
        res.json({message: 'Registration data verified', registrationParsed});
    }catch(error){
        console.error('Error verifying registration:', error.message);
        throw error;
    }
});



app.get('/api/get-challenge', (req, res) => {
    
});


app.get('/', (req, res) => {
    res.send('Welcome to the server!');
});



app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
})

