import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './ViewPrivateTasks.css';

function ViewPrivateTasks() {
    const [tasks, setTasks] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const limit = 10;

    useEffect(() => {
        fetchTasks(page, limit);
    }, [page]);

    const fetchTasks = async (page, limit) => {
        try {
            const res = await axios.get(`/api/private/tasks?page=${page}&limit=${limit}`);
            setTasks(res.data.tasks);
            setTotalPages(res.data.totalPages);
        } catch (err) {
            console.error('Error fetching tasks:', err);
        }
    };
    
    const nextPage = () => {
        if (page < totalPages) {
            setPage(page + 1);
        }
    };

    const prevPage = () => {
        if (page > 1) {
            setPage(page - 1);
        }
    };

    return (
        <div className="view-private-tasks-container">
            <h1 className="view-private-tasks-heading">Tasks:</h1>
            <ul className="view-private-tasks-list">
                {tasks.map(task => (
                    <li key={task.task_id} className="view-private-tasks-item">
                        {task.task_name} {task.task_description}
                        &nbsp;
                        <Link to={`/tasks/${task.task_id}`}>
                            <button className="view-private-tasks-button">Details</button>
                        </Link>
                    </li>
                ))}
            </ul>
            <div className="view-private-tasks-pagination">
                <button className="view-private-tasks-pagination-button" onClick={prevPage} disabled={page === 1}>
                    Previous
                </button>
                <button className="view-private-tasks-pagination-button" onClick={nextPage} disabled={page === totalPages}>
                    Next
                </button>
            </div>
        </div>
    );
}

export default ViewPrivateTasks;
