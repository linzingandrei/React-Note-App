import axios from 'axios'

function RemoveUser(user) {
    // console.log(task)
    // console.log(task)
    async function removeUser() {
        // console.log(task.task_id)
        console.log(user)
        await axios.delete(`/api/users/delete/${user.user_id}`)
            .then(window.location.reload())
            .catch(err => console.log(err))
        // console.log(res)
    }

    return (
        <button onClick = {removeUser}>
            Delete
        </button>
    )
}

export default RemoveUser