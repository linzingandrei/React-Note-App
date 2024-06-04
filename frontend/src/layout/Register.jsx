import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './Register.css'

function Register() {
    const [userEmail, setUserEmail] = useState('')
    const [userName, setUserName] = useState('')
    const [userSurname, setUserSurname] = useState('')
    const [userPassword, setUserPassword] = useState('')
    const [usernameAlreadyExists, setUsernameAlreadyExists] = useState(false);
    // const [userPasswordConfirm, setUserPasswordConfirm] = useState('')
    const navigate = useNavigate()

    async function registerUser() {
        const res = await axios.post('/api/register', {
            user_name: userName,
            user_surname: userSurname,
            user_username: userEmail,
            user_password: userPassword,
        })
        console.log(res.data);
        if(res.data == false) {
            setUsernameAlreadyExists(true);
        }
    }

    function handleRegister() {
        registerUser()
        navigate('/login')
    }

    return (
        <div className='Register-container'>
            <div className="Register">
                <h1>Register</h1>
                <input 
                    className='Register-input'
                    type = 'text'
                    value = { userName }
                    onChange = {(e) => setUserName(e.target.value)}
                    placeholder="Name"
                />
                <br />
                <input
                    className='Register-input'
                    type = 'text'
                    value = { userSurname }
                    onChange = {(e) => setUserSurname(e.target.value)}
                    placeholder="Surname"
                />
                <br />
                <input 
                    className='Register-input'
                    type = 'text'
                    value = { userEmail }
                    onChange = {(e) => setUserEmail(e.target.value)}
                    placeholder="Username"
                />
                <br />
                <input 
                    className='Register-input'
                    type = 'text'
                    value = { userPassword }
                    onChange = {(e) => setUserPassword(e.target.value)}
                    placeholder="Password"
                />
                <br />
                {/* <input 
                    type = 'text'
                    value = { userPasswordConfirm }
                    onChange = {(e) => setUserPasswordConfirm(e.target.value)}
                    placeholder="Confirm Password"
                />
                <br /> */}
                <button className='Register-button' onClick = {handleRegister}>Register</button>
                {usernameAlreadyExists && (<p>Username already exists!</p>)}
                <button className='Register-button' onClick = {() => navigate('/login')}>Login</button>
            </div>
        </div>
    )
}

export default Register