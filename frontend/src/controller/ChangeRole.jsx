import { useState, useEffect } from "react";
import axios from 'axios';

function ChangeRole(user) {
    const [isRegular, setIsRegular] = useState(false);
    const [isManager, setIsManager] = useState(false);

    useEffect(() => {
        const fetchRole = async() => {
            const res = await axios.get(`/api/getRoleOfUser/${user.user_id}`);
            console.log("DATAAA:", res.data)
            switch(res.data) {
                case 'Regular':
                    setIsRegular(true)
                    break
                case 'Manager':
                    setIsManager(true)
                    // setIs
                    break
                default:
                    setIsRegular(false);
                    setIsManager(false);
                    break;
            }
        }
        fetchRole()
    }, [user.user_id])

    async function toggleRegular() {
        const res = await axios.get(`/api/toggleRegular/${user.user_id}`);
        window.location.reload()    
        console.log("agewh", res)
    }

    async function toggleManager() {
        const res = await axios.get(`/api/toggleManager/${user.user_id}`);
        window.location.reload()
        console.log("DATA", res)
    }

    return (
        <div>
            {isRegular && (
                <div>
                    <button onClick={toggleManager}>Manager</button>
                </div>
            )}
            {isManager && (
                <div>
                    <button onClick={toggleRegular}>Regular</button>
                </div>
            )}
        </div>
    );
}

export default ChangeRole;