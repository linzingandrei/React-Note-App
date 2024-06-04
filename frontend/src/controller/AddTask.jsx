import { useState } from 'react'
import axios from 'axios'
import './AddTask.css'

function AddTask() {
    const [task_name, setTaskName] = useState('')
    const [task_description, setTaskDescription] = useState('')
    const [task_deadline, setTaskDeadline] = useState('')
    const [visibility, setVisibility] = useState('private');

    async function addTask() {
        const user_id = await axios.get('/api/user').then(res => {return res.data.user_id})
        if(!task_name || ! task_deadline || !task_description)
            {
                console.log("not ok")
            }
            else {
        await axios.post('/api/tasks/add', {
            task_name: task_name, task_description: task_description, task_deadline: task_deadline, user_id: user_id, visibility_type: visibility})
            .then(
                setTaskName(''),
                setTaskDescription(''),
                setTaskDeadline(''),
            )
            .catch(err => console.log(err))
        }
        // console.log(user_id)
        // console.log(task)
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
            <select value={visibility} onChange={(e) => setVisibility(e.target.value)}>
                <option value='private'>Private</option>
                <option value='public'>Public</option>
                <option value='both'>Both</option>
            </select>
            <button onClick = {addTask}>Add</button>
        </>
    )
}

export default AddTask