import { useNavigate } from 'react-router-dom';
import { client } from '@passwordless-id/webauthn';
import { fetchChallenge,sendUserCredetialsData } from './api';
import { useAuth } from './AuthUse';



function SuccesPage(){

    const navigate = useNavigate();

    const {username,logout} = useAuth();


    async function handleIntegratePasswordless(){

        if(username && username.trim() !== ""){

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

        }
    }

    function handleLogginOutProtectedPage(){
        logout();
        navigate("/");
    }

    return(
        <>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontSize: '40px' }}>
                <div>
                    <h1>Authentication with succes!!!!</h1>
                </div>


                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                    <h2>Change to passwordless auth</h2>
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