import {useState,ChangeEvent} from 'react'
import { client } from '@passwordless-id/webauthn'
import { fetchChallenge,fetchID, sendRegistrationData } from './api.tsx';

function SimplePage(){

    const [users, setUsers] = useState<{UserID: String, UserName: String; passwordUser: String}[]>([]);
    const [newUser, setNewUser] = useState({UserName: "",passwordUser: "",UserID: ""});


    function handleInputNewUserName(event: ChangeEvent<HTMLInputElement>) {
        setNewUser({ ...newUser, UserName: event.target.value});
    };

    function handleInputNewUserPassowrd(event: ChangeEvent<HTMLInputElement>){
        setNewUser({...newUser, passwordUser: event.target.value});
    };

    
    async function handleAddNewUser() {
        if(newUser.UserName.trim() !== "" && newUser.passwordUser.trim() !== ""){
            

            const id = await fetchID();

            const tempUser = { ...newUser, UserID: id};


            const registration = await client.register({
                user: tempUser.UserName,
                challenge: await fetchChallenge(),
            });

            await sendRegistrationData(registration);


            const TempListUsers = [...users, tempUser];
            setUsers(TempListUsers);
            
            setNewUser({UserName: "",passwordUser: "",UserID: ""});
        }
    };

    return(
        <>
            <div>
                <input type="text" placeholder='User Name' value={newUser.UserName} onChange={handleInputNewUserName} ></input>
                <br/>

                <input type="text" placeholder='Password ' value={newUser.passwordUser} onChange={handleInputNewUserPassowrd}></input>
                <br/>

                <button onClick={handleAddNewUser}> Register</button>
                <button> Authentication</button>
            </div>
        </>
    );


}

export default SimplePage