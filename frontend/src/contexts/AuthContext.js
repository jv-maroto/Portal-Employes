import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({ children }) => {
    let [user, setUser] = useState(() => localStorage.getItem('authTokens') ? jwtDecode(localStorage.getItem('authTokens')) : null);
    let [authTokens, setAuthTokens] = useState(() => localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null);
    let [loading, setLoading] = useState(true);
    let [error, setError] = useState(null);

    const navigate = useNavigate();

    let loginUser = async (e) => {
        e.preventDefault();
        const response = await fetch('http://127.0.0.1:8000/api/token/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: e.target.username.value, password: e.target.password.value })
        });

        let data = await response.json();

        if (response.status === 200) {
            localStorage.setItem('authTokens', JSON.stringify(data));
            setAuthTokens(data);
            setUser(jwtDecode(data.access));
            setError(null);
            navigate('/');
        } else {
            setError(data.detail === 'No active account found with the given credentials'
                      ? 'Datos erróneos introducidos. Por favor, inténtalo de nuevo.'
                      : data.detail || 'Something went wrong while logging in the user!');
        }
    };

    let logoutUser = () => {
        localStorage.removeItem('authTokens');
        setAuthTokens(null);
        setUser(null);
        navigate('/login');
    };

    const updateToken = async () => {
        const response = await fetch('http://127.0.0.1:8000/api/token/refresh/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refresh: authTokens?.refresh })
        });

        const data = await response.json();
        if (response.status === 200) {
            setAuthTokens(data);
            setUser(jwtDecode(data.access));
            localStorage.setItem('authTokens', JSON.stringify(data));
        } else {
            logoutUser();
        }

        if (loading) {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authTokens) {
            const decodedToken = jwtDecode(authTokens.access);
            console.log(decodedToken); // Verifica que `is_superuser` esté presente aquí
        }
    }, [authTokens]);

    let contextData = {
        user,
        authTokens,
        loginUser,
        logoutUser,
        error,
    };

    useEffect(() => {
        if (loading) {
            updateToken();
        }

        const REFRESH_INTERVAL = 1000 * 60 * 4; // 4 minutes
        let interval = setInterval(() => {
            if (authTokens) {
                updateToken();
            }
        }, REFRESH_INTERVAL);
        return () => clearInterval(interval);

    }, [authTokens, loading]);

    return (
        <AuthContext.Provider value={contextData}>
            {children}
        </AuthContext.Provider>
    );
};
