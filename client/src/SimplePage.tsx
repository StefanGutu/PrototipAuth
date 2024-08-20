import {useState,ChangeEvent} from 'react'
import { client } from '@passwordless-id/webauthn'
import { fetchChallenge,fetchID, sendRegistrationData ,sendAuthenticationData} from './api.tsx';
import { useNavigate } from 'react-router-dom';


function SimplePage(){

    const [users, setUsers] = useState<{UserID: String, UserName: String,UserPassword: String}[]>([]);
    const [newUser, setNewUser] = useState({UserName: "",UserID: "",UserPassword: ""});

    const navigate = useNavigate();

    function handleInputNewUserName(event: ChangeEvent<HTMLInputElement>) {
        setNewUser({ ...newUser, UserName: event.target.value});
    };

    function handleInputNewUserPassword(event: ChangeEvent<HTMLInputElement>){
        setNewUser({...newUser, UserPassword: event.target.value})
    }

    
    //Function that handle when a new user register in 
    async function handleAddNewUser() {
        if(newUser.UserName.trim() !== ""){
            

            const id = await fetchID(); //get a random ID 

            const tempUser = { ...newUser, UserID: id}; 

            
            const registration = await client.register({ //trigger the registration in browser
                user: tempUser.UserName,
                challenge: await fetchChallenge(), // generate a random challenge
            });

            const response = await sendRegistrationData(registration); //sends data and will check the challenge on the server side

            if(response){ // check the response if its true you will pass to the protected page
                localStorage.setItem('authToken','true');
                navigate("/SuccesPage");
            }else if(response === false){ // if not you will remain in SimplePage
                navigate("/");
            }

            const TempListUsers = [...users, tempUser];
            setUsers(TempListUsers);
            
            setNewUser({UserName: "",UserID: "",UserPassword: ""});
        }
    };




    async function handleCheckOldUser() {
        try {
            
            const authentication = await client.authenticate({
                challenge: await fetchChallenge(),
            });
            
            
            const response = await sendAuthenticationData(authentication);

            console.log("Response: ", response);

            if(response){
                localStorage.setItem('authToken','true');
                navigate("/SuccesPage");
            }else if(response === false){
                navigate("/");
            }
            
        } catch (error) {
            console.error("Error during authentication:", error);
        }

    }
    

    return(
        <>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontSize: '40px' }} >
                
                <div>
                    <input type="text" placeholder='User Name' value={newUser.UserName} onChange={handleInputNewUserName} ></input>
                    <input type="text" placeholder='Password' value={newUser.UserPassword} onChange={handleInputNewUserPassword} ></input>
                </div>

                <div>
                    <button onClick={handleAddNewUser}> Register</button>
                    <button onClick={handleCheckOldUser} > Authentication</button>
                </div>

            </div>
        </>
    );


}




export default SimplePage