import { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import axios from 'axios';

function PrivateRoute() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // console.log("A AJUNS")
        
        async function checkLoggedIn() {
            try {
                const response = await axios.get('/api/isLoggedIn');
                console.log('API response:', response.data.isLoggedIn);
                if (response.data.isLoggedIn) {
                    console.log('Setting isAuthenticated to true');
                    setIsAuthenticated(true);
            } else {
                console.log('Setting isAuthenticated to false');
                setIsAuthenticated(false);
            }
            } catch (error) {
                console.error('Error checking if user is logged in:', error);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        }
        
        checkLoggedIn()

    }, []);

    // useEffect(() => {
    //     console.log('isAuthenticated:', isAuthenticated)
    // }, [isAuthenticated])

    if (isLoading) {
        return <div>Loading...</div>;
    }
    // console.log(isAuthenticated)
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" />
}

export default PrivateRoute