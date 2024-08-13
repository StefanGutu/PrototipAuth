import { useNavigate } from 'react-router-dom';


function SuccesPage(){

    const navigate = useNavigate();

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
                    <button onClick={handleLogginOutProtectedPage}> Log out </button>
                </div>
            </div>
        </>
    );
}

export default SuccesPage;