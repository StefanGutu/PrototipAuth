
export async function fetchChallenge(){
    try{
        const response = await fetch('http://localhost:3000/api/generate-challenge',{
            method: 'POST', 
            headers:{
                'Content-Type': 'application/json', // set the content to type JSON
            },  
        });

        if(!response.ok){
            throw new Error("Error fetchChallenge");
        }

        const data = await response.json();
        return data.challenge;

    } catch(error){
        console.error("Error fetchChallenge");
        throw error;
    }
}

export async function fetchID() {
    try {
        const response = await fetch('http://localhost:3000/api/generate-ID', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error("Error fetchID");
        }

        const data = await response.json();
        return data.id;

    } catch (error) {
        console.error("Error fetchID:", error);
        throw error;
    }
}



export async function sendRegistrationData(registrationData: object) {
    try {
        const response = await fetch('http://localhost:3000/api/register-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ registrationData }),
        });

        if (!response.ok) {
            // Log the response body for better error insight
            const errorText = await response.text();
            throw new Error(`Error sending registration data: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error sending registration data:', error);
        throw error;
    }
}


export async function sendAuthenticationData(authenticationData: object){
    try{
        const response = await fetch("http://localhost:3000/api/authentication-user",{
            method: 'POST',
            headers: {
                'Content-Type':'application/json',
            },
            body: JSON.stringify({authenticationData}),
        });

        if(!response.ok){
            const errorText = await response.text();
            throw new Error(`Error sending registration data: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        return result;
    }catch(error){
        console.error("Error sending authentication data:", error);
        throw error;
    }
}


