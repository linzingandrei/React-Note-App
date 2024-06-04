import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import RemoveTask from '../controller/RemoveTask';
import UpdateTask from '../controller/UpdateTask';
import './ViewTaskDetails.css';

function ViewTaskDetails() {
    const [task, setTask] = useState('');
    const [task_deadline, setTaskDeadline] = useState('');
    const { id } = useParams();

    useEffect(() => {
        axios.get(`/api/tasks/${id}`)
            .then(res => {
                setTask(res.data);
                setTaskDeadline(res.data.task_deadline);
            }).catch(err => {
                console.log(err);
            });
    }, [id]);

    return (
        <>
            {task ? (
                <div className="container">
                    <h1>Task Details</h1>
                    <div className="task-details">
                        <p><strong>ID:</strong> {task.task_id}</p>
                        <p><strong>Name:</strong> {task.task_name}</p>
                        <p><strong>Description:</strong> {task.task_description}</p>
                        <p><strong>Task Deadline:</strong> {task_deadline.substring(0, 10)}</p>
                    </div>
                    <div className="task-actions">
                        <UpdateTask task_id={task.task_id} />
                        <RemoveTask task_id={task.task_id} />
                    </div>
                </div>
                ):
                <div>
                    <h1>No access!</h1>
                </div>
            }
        </>
    );
}

export default ViewTaskDetails;
