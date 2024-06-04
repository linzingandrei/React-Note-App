import { useState } from "react"
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import "./Login.css"
// import PrivateRoute from "../controller/PrivateRoute"

function Login() {
    const [userEmail, setUserEmail] = useState('')
    const [userPassword, setUserPassword] = useState('')
    const navigate = useNavigate()
    const [errorMessage, setErrorMessage] = useState('');

    // console.log(document.cookie)

    async function loginUser() {
        try {
            const response = await axios.post('/api/login', {
                user_username: userEmail,
                user_password: userPassword
            })
            if (response.status === 200) {
                alert('Logged in')
                navigate('/tasks', {replace: true})
            }
        } catch (error) {
            setErrorMessage('Failed to login');
        }
    }

    return (
        <div className="Login-container">
            <div className="Login">
                <h1>Login</h1>
                <input 
                    className="Login-input"
                    type = 'text'
                    value = { userEmail }
                    onChange = {(e) => setUserEmail(e.target.value)}
                    placeholder="Username"
                />
                <br />
                <input 
                    className="Login-input"
                    type = 'text'
                    value = { userPassword }
                    onChange = {(e) => setUserPassword(e.target.value)}
                    placeholder="Password"
                />
                <br />
                {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
                &nbsp;
                <button className="Login-button" onClick = {loginUser}>Login</button>
                <button className="Login-button" onClick = {() => navigate('/register')}>Register</button>
            </div>
        </div>
    )
}

export default Login