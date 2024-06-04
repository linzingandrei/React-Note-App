import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './ViewTasks.css';

function ViewTasks() {
    const [tasks, setTasks] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const taskIds = useRef(new Set());
    const [taskAccess, setTaskAccess] = useState({});

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                
                const res = await axios.get(`/api/public/tasks?page=${page}&limit=10`);
                const newTasks = res.data.tasks.filter(task => !taskIds.current.has(task.task_id));
                newTasks.forEach(task => taskIds.current.add(task.task_id));
                setTasks(prevTasks => [...prevTasks, ...newTasks]);
                setLoading(false);
                console.log(newTasks)
            } catch (err) {
                console.error('Error fetching tasks:', err);
            }
        };

        fetchTasks();
    }, [page]);

    const handleScroll = () => {
        if (window.innerHeight + document.documentElement.scrollTop + 1 >= document.documentElement.scrollHeight) {
            setLoading(true);
            setPage(prevPage => prevPage + 1);
        }
    };

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    async function getNumberTasks() {
        const res = await axios.get('/api/getNumberOfTasks')
        return res.data;
    }

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8080');

        async function messageHandler(event) {
            const message = JSON.parse(event.data);
            console.log(message);
            const number_of_tasks = await getNumberTasks();
            switch (message.type) {
                case 'ADD_TASK':
                    console.log("ADDED!");
                    console.log("TASKS LENGTH:", tasks.length)
                    console.log("NUMBER OF TASKS:", number_of_tasks.COUNT)
                    if(tasks.length == number_of_tasks.COUNT - 1)
                        setTasks(prevTasks => [...prevTasks, message.payload]);
                    // }
                    break;
                case 'UPDATE_TASK':
                    console.log(message.payload);
                    setTasks(prevTasks => prevTasks.map(task =>
                        task.task_id === message.payload.task_id ? message.payload : task
                    ));
                    break;
                case 'DELETE_TASK':
                    console.log(message.payload);
                    setTasks(prevTasks => prevTasks.filter(task => task.task_id != message.payload));
                    break;
                default:
                    console.log('Unknown message type');
            }
        }

        socket.addEventListener('message', messageHandler);

        return () => {
            socket.removeEventListener('message', messageHandler);
        };
    }, [tasks.length]);

    useEffect(() => {
        tasks.forEach(async task => {
            const response = await axios.get('/api/getCookie');
            console.log(response.data.decoded)
            if (response.status === 200) {
                if (response.data.decoded.role == 'Regular') {
                    try {
                        
                        if (response.status === 200) {
                            setTaskAccess(prevAccess => ({ ...prevAccess, [task.task_id]: response.data.decoded.id === task.user_id }));
                        } else {
                            setTaskAccess(prevAccess => ({ ...prevAccess, [task.task_id]: false }));
                        }
                    } catch (error) {
                        console.error('Error verifying access:', error);
                        setTaskAccess(prevAccess => ({ ...prevAccess, [task.task_id]: false }));
                    }
                }
                else {
                    try {
                        setTaskAccess(prevAccess => ({ ...prevAccess, [task.task_id]: true }));
                    } catch (error) {
                        console.error('Error verifying access:', error);
                        setTaskAccess(prevAccess => ({ ...prevAccess, [task.task_id]: true }));
                    }
                }
            }
            else {
                console.log('response error')
            }
            });
    }, [tasks]);

    return (
        <div className="app-container">
            <h1>Tasks:</h1>
            <ul className="tasks-list">
                {tasks.map(task => (
                    <li key={task.task_id} className="task-item">
                        <div>
                            <h2>{task.task_name}</h2>
                            <p>{task.task_description}</p>
                        </div>
                        {taskAccess[task.task_id] && (
                            <Link to={`/tasks/${task.task_id}`}>
                                <button className="details-button">Details</button>
                            </Link>
                        )}
                    </li>
                ))}
            </ul>
            {loading && <p>Loading...</p>}
        </div>
    );
}

export default ViewTasks;
