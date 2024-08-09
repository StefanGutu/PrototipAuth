import {useState,ChangeEvent} from 'react'
import { client } from '@passwordless-id/webauthn'
import { fetchChallenge,fetchID, sendRegistrationData ,sendAuthenticationData} from './api.tsx';

function SimplePage(){

    const [users, setUsers] = useState<{UserID: String, UserName: String}[]>([]);
    const [newUser, setNewUser] = useState({UserName: "",UserID: ""});


    function handleInputNewUserName(event: ChangeEvent<HTMLInputElement>) {
        setNewUser({ ...newUser, UserName: event.target.value});
    };

    
    
    async function handleAddNewUser() {
        if(newUser.UserName.trim() !== ""){
            

            const id = await fetchID();

            const tempUser = { ...newUser, UserID: id};


            const registration = await client.register({
                user: tempUser.UserName,
                challenge: await fetchChallenge(),
            });

            await sendRegistrationData(registration);


            const TempListUsers = [...users, tempUser];
            setUsers(TempListUsers);
            
            setNewUser({UserName: "",UserID: ""});
        }
    };

    async function handleCheckOldUser() {
        try {
            const authentication = await client.authenticate({
                challenge: await fetchChallenge(),
            });
            await sendAuthenticationData(authentication);
        } catch (error) {
            console.error("Error during authentication:", error);
        }

    }
    

    return(
        <>
            <div>
                <input type="text" placeholder='User Name' value={newUser.UserName} onChange={handleInputNewUserName} ></input>
                <br/>


                <button onClick={handleAddNewUser}> Register</button>
                <button onClick={handleCheckOldUser} > Authentication</button>
            </div>
        </>
    );


}

export default SimplePage