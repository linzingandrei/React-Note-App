import axios from "axios"
import { useState } from "react"

function UpdateTask(task) {
    const [task_name, setTaskName] = useState('')
    const [task_description, setTaskDescription] = useState('')
    const [task_deadline, setTaskDeadline] = useState('')

    async function updateTask() {
        axios.put(`/api/tasks/${task.task_id}`, {
            task_name: task_name, task_description: task_description, task_deadline: task_deadline})
            .then(
                window.location.reload(),
                setTaskName(''),
                setTaskDescription(''),
                setTaskDeadline('')
            )
            .catch(err => console.log(err))
    }
    
    return (
        <>
            <input 
                type = 'text'
                value = {task_name}
                onChange = {(e) => setTaskName(e.target.value)}
            />
            <input 
                type = 'text'
                value = {task_description}
                onChange = {(e) => setTaskDescription(e.target.value)}
            />
            <input 
                type = 'date'
                value = {task_deadline}
                onChange = {(e) => setTaskDeadline(e.target.value)}
            />
            <button onClick = {updateTask}>Update</button>
        </>
    )
}

export default UpdateTask