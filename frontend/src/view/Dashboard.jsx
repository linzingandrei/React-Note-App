import { useEffect, useState } from "react";
import axios from 'axios';
import RemoveUser from "../controller/RemoveUser";
import ChangeRole from "../controller/ChangeRole";

function Dashboard() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isManager, setIsManager] = useState(false);
    const [username, setUsername] = useState('');
    const [users, setUsers] = useState([]);
    
    useEffect(() => {
        const fetchRole = async () => {
            const users = await axios.get('/api/listOfUsers');
            setUsers(users.data);
            console.log(users.data)

            const res = await axios.get('/api/getRole');
            const role = res.data

            const res2 = await axios.get('/api/getUsername')
            // console.log(res2);
            setUsername(res2.data);

            console.log("ROLE:", role)
            if (role == 'Admin') {
                setIsAdmin(true);
                // setIsManager(true);
            }
            if (role == 'Moderator') {
                setIsManager(true);
            }
        };

        fetchRole();

    },[]);

    return (
        <>
            <h1>Hello, {username}!</h1>
            { isAdmin && (
                <div>
                <h1>Your admin panel:</h1>
                <h2>Users: </h2>
                <ul className="tasks-list">
                    {users.map(user => (
                        <li style={{ fontSize: '25px' }} key={user.user_id} className="task-item">
                            {user.user_username}
                            <ChangeRole user_id={user.user_id}/>
                            <RemoveUser user_id={user.user_id}/>
                        </li>
                        
                    ))}
                </ul>
            </div>
            )}
            { isManager && !isAdmin && (
                <h1>Your manager panel:</h1>
            )}
        </>
    )
}

export default Dashboard;