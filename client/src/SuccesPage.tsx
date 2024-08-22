import { useNavigate } from 'react-router-dom';
import { ChangeEvent, useState } from 'react';
import { client } from '@passwordless-id/webauthn';
import { fetchChallenge,sendUserCredetialsData } from './api';



function SuccesPage(){

    const [username, setUser] = useState<string>("");

    const navigate = useNavigate();

    function handleUsernameChange(event: ChangeEvent<HTMLInputElement>){
        setUser(event.target.value);
    }

    async function handleIntegratePasswordless(){
        if(username.trim() !== ""){

            const registration =await client.register({
                user: username,
                challenge: await fetchChallenge(),
            });

            console.log("----------------------------------------");
            console.log("Registration data",registration.user);

            const response = await sendUserCredetialsData(registration);

            if(response === true){
                console.log("Everything is alright with credetial registration!");
            }

            setUser("");
        }
    }

    function handleLogginOutProtectedPage(){
        localStorage.removeItem('authToken');
        navigate("/");
    }

    return(
        <>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontSize: '40px' }}>
                <div>
                    <h1>Authentication with succes!!!!</h1>
                </div>


                <div>
                    <h2>Change to passwordless auth</h2>
                    <input type="text" placeholder='User name' value={username} onChange={handleUsernameChange}></input>
                    <button onClick={handleIntegratePasswordless} >Change now</button>
                </div>

                <div>
                    <button onClick={handleLogginOutProtectedPage}> Log out </button>
                </div>
            </div>
        </>
    );
}

export default SuccesPage;