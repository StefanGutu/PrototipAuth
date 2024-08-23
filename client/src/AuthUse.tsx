import React, { createContext, useState, useContext } from 'react';


interface AuthContextType {
    token: string | null;
    userID: string | null;
    username: string | null;
    login: (newToken: string,newID: string,username: string) => void;
    logout: () => void;
}


const AuthContext = createContext<AuthContextType| null>(null); 


export const AuthUtil = ({ children }: { children: React.ReactNode }) => {
    const [token, setToken] = useState<string | null>(null);
    const [userID,setUserID] = useState <string | null>(null);
    const [username, setUsername] = useState < string | null>(null);

    //function that store the token when user login
    const login = (newToken: string,newID: string,username: string) => {
        setToken(newToken);
        setUserID(newID);
        setUsername(username);
    };

    //Function when logout will set token to be null
    const logout = () => { 
        setToken(null);
        setUserID(null);
        setUsername(null);
    };


    return(
        <AuthContext.Provider value={{token,userID,username,login,logout}}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === null) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}