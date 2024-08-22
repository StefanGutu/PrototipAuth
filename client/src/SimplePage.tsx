import {useState,ChangeEvent} from 'react'
import { client } from '@passwordless-id/webauthn'
import { fetchID,fetchChallenge,sendUserRegistrationData,sendUserAuthenticationData,sendAuthenticationDataCredetial} from './api.tsx';
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




    async function handleAddNewUser() {
        if(newUser.UserName.trim() !== "" && newUser.UserPassword.trim() !== ""){

            const id = await fetchID();
            const tempUser = {...newUser,UserID: id};

            const response = await sendUserRegistrationData(tempUser);

            if(response === true) {
                const TempListUsers = [...users, tempUser];
                setUsers(TempListUsers);
                
                setNewUser({UserName: "",UserID: "",UserPassword: ""});

                
                navigate("/SuccesPage");

            }else{
                navigate("/");
            }

        }

    }


    async function handleCheckOldUser() {
        if(newUser.UserName.trim() !== "" && newUser.UserPassword.trim() !== ""){
            try{
                const response = await sendUserAuthenticationData(newUser);

                if(response ===  true){
                    navigate("/SuccesPage"); 
                }
            }catch(error){
                console.error("Error sending authentication:", error);
            }

        }else if(newUser.UserName.trim() !== ""){

            try{
                const authentication = await client.authenticate({
                    challenge: await fetchChallenge(),
                });
    
                const authenticationData = {
                    username: newUser.UserName,
                    authentication
                }
                
                try{
                    const response = await sendAuthenticationDataCredetial(authenticationData);
    
                    if(response ===  true){
                        navigate("/SuccesPage"); 
                    }

                }catch(error){
                    console.error("Error sending authentication:", error);
                }

                
            }catch(error){
                console.error("Error during authentication:", error);
            }
        }
        setNewUser({UserName: "",UserID: "",UserPassword: ""});
    };



    
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