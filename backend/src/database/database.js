import mysql from 'mysql2'
import dotenv from 'dotenv'

dotenv.config()

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise()

export async function getUsersExceptSelfButBasedOnPermissions(user_id, role_id) {
    if (role_id > 1) {
        const result = await pool.query(`
        SELECT *
        FROM Users
        WHERE user_id <> ? AND user_role < ?
        `, [user_id, role_id])
        const rows = result[0]
        return rows
    }
    else {
        console.log('Normal user')
    }
}

export async function getUserIdOfTask(task_id) {
    const result = await pool.query(`
    SELECT user_id
    FROM Tasks
    WHERE task_id = ?
    `, [task_id])
    const rows = result[0]
    return rows[0].user_id
}

export async function getUsernameOfUserWithCertainId(user_id) {
    const result = await pool.query(`
    SELECT user_username
    FROM Users
    WHERE user_id = ?
    `, [user_id])
    const rows = result[0]
    return rows[0].user_username
}

export async function getUser(user_username) {
    const result = await pool.query(`
    SELECT *
    FROM Users
    WHERE user_username = ?
    `, [user_username])
    const rows = result[0]
    return rows[0]
}

export async function getUsers() {
    const result = await pool.query(`
    SELECT user_username
    FROM Users
    `)
    const rows = result[0]
    return rows
}

export async function createUser(user_name, user_surname, user_username, user_password) {
    const existingUsers = await getUsers();
    let ok = true;
    // console.log(existingUsers)
    existingUsers.forEach(user => {
        // console.log(user.user_username)
        if (user.user_username === user_username) {
            // console.log("A Ajuns")
            ok = false;
        }
    })
    if (!ok) {
        return ok;
    }
    else {
        const result = await pool.query(`
        INSERT INTO Users (user_name, user_surname, user_username, user_password, user_role)
        VALUES (?, ?, ?, ?, ?)
        `, [user_name, user_surname, user_username, user_password, 1])
        const rows = result[0]
        const id = rows.insertId
        return getUser(id)
    }
}

export async function changeRoleToRegular(user_id) {
    const result = await pool.query(`
    UPDATE Users
    SET user_role = 1
    WHERE user_id = ?
    `, [user_id])
}

export async function getTaskVisibility(task_id) {
    const result = await pool.query(`
    SELECT visibility_id
    FROM Tasks
    WHERE task_id = ?
    `, [task_id])
    const rows = result[0]
    return rows[0].visibility_id
}

export async function changeRoleToManager(user_id) {
    const result = await pool.query(`
    UPDATE Users
    SET user_role = 2
    WHERE user_id = ?
    `, [user_id])
    return getUser(user_id)
}

export async function getRoles() {
    const result = await pool.query("SELECT * FROM Roles")
    const rows = result[0]
    return rows
}

export async function getUserRole(userId) {
    const result = await pool.query(`
    SELECT Roles.role_name
    FROM Roles
    INNER JOIN Users ON Users.user_role = Roles.role_id
    WHERE Users.user_id = ?
    `, [userId])
    const rows = result[0]
    return rows[0].role_name
}

// const result = await getUserRole(1)
// console.log(result)

export async function createRole(role_name) {
    const result = await pool.query(`
    INSERT INTO Roles (role_name)
    VALUES (?)
    `, [role_name])
    const rows = result[0]
    const id = rows.insertId
    return getRole(id)
}

export async function getNumberOfTasks() {
    const result = await pool.query(`
    SELECT COUNT(*) AS COUNT
    FROM Tasks
    WHERE visibility_id = 2 OR visibility_id = 3
    `)
    const rows = result[0]
    return rows[0]
}

export async function removeRole(role_id) {
    await pool.query(`
    DELETE
    FROM Roles
    WHERE role_id = ?
    `, [role_id])
    // const rows = result[0]
    // const affectedRows = rows.affectedRows
    // return result
}

export async function updateRole(role_id, role_name) {
    await pool.query(`
    UPDATE Roles
    SET role_name = ?
    WHERE role_id = ?
    `, [role_name, role_id])
    return(getRole(role_name))
}

// export async function createRefreshToken(user_id, token) {
//     const result = await pool.query(`
//     INSERT INTO RefreshTokens (user_id, token)
//     VALUES (?, ?)
//     `, [user_id, token])
//     const rows = result[0]
//     return rows.insertId
// }

// export async function getRefreshToken(token) {
//     const result = await pool.query(`
//     SELECT *
//     FROM RefreshTokens
//     WHERE token = ?
//     `, [token])
//     const rows = result[0]
//     return rows[0]
// }

// export async function deleteRefreshToken(token) {
//     await pool.query(`
//     DELETE FROM RefreshTokens
//     WHERE token = ?
//     `, [token])
// }

export async function getTasks(limit, offset) {
    const tasksQuery = `
        SELECT Tasks.*, Visibility.visibility_type 
        FROM Tasks 
        INNER JOIN Visibility ON Tasks.visibility_id = Visibility.visibility_id 
        WHERE (Visibility.visibility_type = ? OR Visibility.visibility_type = ?)
        LIMIT ? OFFSET ?
    `;
    const countQuery = `
        SELECT COUNT(*) AS total
        FROM Tasks 
        INNER JOIN Visibility ON Tasks.visibility_id = Visibility.visibility_id 
        WHERE (Visibility.visibility_type = ? OR Visibility.visibility_type = ?)
    `;

    const [tasksResult, countResult] = await Promise.all([
        pool.query(tasksQuery, ['public', 'both', limit, offset]),
        pool.query(countQuery, ['public', 'both'])
    ]);

    const tasks = tasksResult[0];
    const totalTasks = countResult[0][0].total;
    // console.log(tasks, totalTasks)
    return { tasks, totalTasks };
}

export async function getTasksOfAParticularUser(user_id, limit, offset) {
    // const result = await pool.query(`
    // SELECT Tasks.*, Visibility.visibility_type 
    // FROM Tasks 
    // INNER JOIN Visibility ON Tasks.visibility_id = Visibility.visibility_id 
    // WHERE Tasks.user_id = ? AND (Visibility.visibility_type = ? OR Visibility.visibility_type = ?)
    // `, [user_id, 'private', 'both'])
    // const rows = result[0]
    // return rows
    const tasksQuery = `
        SELECT Tasks.*, Visibility.visibility_type 
        FROM Tasks 
        INNER JOIN Visibility ON Tasks.visibility_id = Visibility.visibility_id 
        WHERE Tasks.user_id = ? AND (Visibility.visibility_type = ? OR Visibility.visibility_type = ?)
        LIMIT ? OFFSET ?
    `;
    const countQuery = `
        SELECT COUNT(*) AS total
        FROM Tasks 
        INNER JOIN Visibility ON Tasks.visibility_id = Visibility.visibility_id 
        WHERE Tasks.user_id = ? AND (Visibility.visibility_type = ? OR Visibility.visibility_type = ?)
    `;

    const [tasksResult, countResult] = await Promise.all([
        pool.query(tasksQuery, [user_id, 'private', 'both', limit, offset]),
        pool.query(countQuery, [user_id, 'private', 'both'])
    ]);

    const tasks = tasksResult[0];
    const totalTasks = countResult[0][0].total;

    return { tasks, totalTasks };
}

export async function getTask(task_id) {
    const result = await pool.query(`
    SELECT Tasks.*, Visibility.visibility_type 
    FROM Tasks 
    INNER JOIN Visibility ON Tasks.visibility_id = Visibility.visibility_id 
    WHERE Tasks.task_id = ?
    `, [task_id])
    const rows = result[0][0]
    // console.log(rows)
    return rows
}

export async function getTaskIdsForASpecificUser(user_id) {
    const result = await pool.query(`
    SELECT task_id
    FROM Tasks
    WHERE user_id = ?
    `, [user_id])
    const rows = result[0]
    console.log(rows)
    return rows
}

// console.log(getTaskIdsForASpecificUser(1))

export async function createTask(task_name, task_description, task_deadline, user_id, visibility_type) {
    const visibilityResult = await pool.query(`
    SELECT visibility_id FROM Visibility WHERE visibility_type = ?
    `, [visibility_type])
    const visibility_id = visibilityResult[0][0].visibility_id

    const result = await pool.query(`
    INSERT INTO Tasks (task_name, task_description, task_deadline, user_id, visibility_id)
    VALUES (?, ?, ?, ?, ?)
    `, [task_name, task_description, task_deadline, user_id, visibility_id])
    const rows = result[0]
    const id = rows.insertId
    return getTask(id)
}

export async function removeUser(user_id) {
    await pool.query(`
    DELETE
    FROM Users
    WHERE user_id = ?
    `, [user_id])
    // const rows = result[0]
    // const affectedRows = rows.affectedRows
    // return result
}

export async function removeTask(task_id) {
    await pool.query(`
    DELETE
    FROM Tasks
    WHERE task_id = ?
    `, [task_id])
    // const rows = result[0]
    // const affectedRows = rows.affectedRows
    // return result
}

export async function updateTask(task_id, task_name, task_description, task_deadline) {
    await pool.query(`
    UPDATE Tasks
    SET task_name = ?, task_description = ?, task_deadline = ?
    WHERE task_id = ?
    `, [task_name, task_description, task_deadline, task_id])
    return(getTask(task_id))
}

// const students = await getStudents()
// console.log(students)

// const student = await getStudent(1)
// console.log(student)

// const newStudent = await createStudent('George', 'David', '2000-10-30')
// console.log(newStudent)

// const deletedStudent = await removeStudent(3)
// console.log(deletedStudent)