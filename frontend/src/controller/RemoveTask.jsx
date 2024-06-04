import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function RemoveTask(task) {
    const navigate = useNavigate();
    // console.log(task)
    // console.log(task)
    async function removeTask() {
        // console.log(task.task_id)
        axios.delete(`/api/tasks/delete/${task.task_id}`)
            .then(
                navigate('/tasks/view', { replace: true }),
                window.location.reload()
            )
            .catch(err => console.log(err))
    }

    return (
        <button onClick = {removeTask}>
            Delete
        </button>
    )
}

export default RemoveTask