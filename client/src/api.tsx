
interface userData { 
    UserName: string;
    UserPassword: string;
    UserID: string; 
}

//----------------------------------------------------------------------
const vapidPublicKey = "BLfq3iDTKDQYMeUpFjz2vTjsqWekSHkCB4Fzv5EKKzXcxPDP7rH8SOdn7DqIyEujKey-SpOXwYGWmSv_XFjb9Og"

if ("serviceWorker" in navigator) {
    sendPushNotification().catch(err => console.error(err));
}

function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");
  
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
  
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

async function sendPushNotification(){

    console.log("Before Register!");
    const register = await navigator.serviceWorker.register('/ServiceWorker.js', {})
    console.log("Service Worker Registered!");


    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);


    const subscription = await register.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
    })
    .catch(err => {
        console.error('Error in subscription:', err);
    });

    console.log("Push Manager subscription with success: ", subscription);


    const response = await fetch('https://localhost:3000/api/send-notification',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({subscription}),
    });

    if(!response.ok){
        throw new Error("Error fetch send-notification");
    }
    console.log("Push sent"); 
}



//----------------------------------------------------------------------

export async function fetchChallenge(){
    try{
        const response = await fetch('https://localhost:3000/api/generate-challenge',{
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


export async function fetchID(): Promise<string> {
    try {
        const response = await fetch('https://localhost:3000/api/generate-ID', {
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



export async function sendUserRegistrationData(registrationData: object){
    try{
        const response = await fetch('https://localhost:3000/api/register-user',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({registrationData}),
        });

        if(!response.ok){
            const errorText = await response.text();
            throw new Error(`Error sending user registration data: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log("Registration success:",result);
        return result;

    }catch(error){
        console.error('Error in function sendUserRegistrationData:', error);
        throw error;
    }
}



export async function sendUserAuthenticationData(authenticationData: userData) {
    const userDataModif = btoa(`${authenticationData.UserName}:${authenticationData.UserPassword}`);


        try{
            const response = await fetch('https://localhost:3000/api/authentication-user',{
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${userDataModif}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    UserName: authenticationData.UserName,
                    UserPassword: authenticationData.UserPassword
                }),
            });


            if(!response.ok){
                const errorText = await response.text();
                throw new Error(`Error sending user authentication data:  ${response.status} - ${errorText}`);
            }

            const result = await response.json();
            console.log("Authentication success: ",result);
            return result;

        }catch(error){
            console.error('Error in function sendUserAuthenticationData:',error);
            throw error;
        }
}


//-------------------------------------------------------------------------------------------------------------------

export async function sendUserCredetialsData(registrationData: object): Promise<boolean> {
    try {
        const response = await fetch('https://localhost:3000/api/register-user-credetial', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ registrationData }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error sending registration data: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log("Registration success:",result);

        if(result !== 'true'){
            return false;
        }else{
            return true;
        }
        
    } catch (error) {
        console.error('Error sending registration data:', error);
        throw error;
    }
}


export async function sendAuthenticationDataCredetial(authenticationData: object){
    
    try{

        const response = await fetch("https://localhost:3000/api/authentication-user-credetial",{
            method: 'POST',
            headers: {
                'Content-Type':'application/json',
            },
            body: JSON.stringify({authenticationData}),
        });

        
        if(!response.ok){
            const errorText = await response.text();
            throw new Error(`Error sending authentication data: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log("Authentication success:",result);

        return result;

    }catch(error){
        console.error("Error sending authentication data:", error);
        throw error;
    }
}


