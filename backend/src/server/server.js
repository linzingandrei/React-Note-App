import express from 'express'
import { getTasks, getUsersExceptSelfButBasedOnPermissions, getTask, createTask, removeTask, updateTask, getTasksOfAParticularUser, getTaskIdsForASpecificUser, getUserIdOfTask, getUsernameOfUserWithCertainId, changeRoleToRegular, changeRoleToManager, getTaskVisibility, getNumberOfTasks } from '../database/database.js'
import { removeUser, createUser, getUser, getUserRole } from '../database/database.js'
import { WebSocketServer } from 'ws'
import http from 'http'
import https from 'https'
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'
import authenticate from '../middleware/authenticate.js'
import cookieParser from 'cookie-parser'
import fs from 'fs';
// import cors from 'cors'

const app = express()

const server = https.createServer({
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),
}, app)
// const server = http.createServer(app);
const wss = new WebSocketServer({ server: server });

// app.use(cors());

app.use(express.json())
app.use(express.static('../../dist'))
app.use(cookieParser());

app.post('/api/register', async (req, res) => {
    try {
        const { user_name, user_surname, user_username, user_password } = req.body
        const hashedPassword = await bcrypt.hash(user_password, 10);
        const user = await createUser(user_name, user_surname, user_username, hashedPassword);
        console.log(user);
        if (user == false) {
            res.status(201).send(false);
        }
        else {
            res.status(201).send({ message: 'User registered', user });
        }
    } catch(err) {
        console.log(err)
        res.status(500).send();
    }
});

app.get('/api/listOfUsers', authenticate, async (req, res) => {
    let role_id = 0
    const accessToken = req.cookies['access-token'];
    var decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    // console.log(decoded)
    if (decoded.role == 'Admin') {
        role_id = 3
    }
    else if (decoded.role == 'Manager') {
        role_id = 2
    }
    else {
        role_id = 1
    }
    // console.log("USER: ", decoded.id)
    // console.log("ROLE ID: ", role_id)
    const users = await getUsersExceptSelfButBasedOnPermissions(decoded.id, role_id);
    // console.log(users)
    res.status(200).send(users);
});

app.get('/api/getCookie', (req, res) => {
    const accessToken = req.cookies['access-token'];
    if (accessToken) {
        var decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        // console.log(decoded);
        res.status(200).json({decoded});
        // console.log("da")
    } else {
        res.status(404).send({ message: 'No access token found' });
    }
});


app.post('/api/login', async (req, res) => {
    try {
        const { user_username, user_password } = req.body
        const user = await getUser(user_username);
        // console.log("USERRRR", user)
        // let rolee = '';
        if (user) {
            if (await bcrypt.compare(user_password, user.user_password) && user.user_username === user_username) {
                const role = await getUserRole(user.user_id);
                const accessToken = jwt.sign({ id: user.user_id, role: role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
                res.cookie('access-token', accessToken, { httpOnly: true, secure: false });
                res.status(200).send({ message: 'Logged in' });
            } else {
                res.status(403).send({ message: 'Not Allowed' });
            }
        } else {
            res.status(404).send({ message: 'User not found' });
        }
    } catch(err) {
        console.log(err)
        res.status(500).send();
    }
});

app.get('/api/isLoggedIn', authenticate, (req, res) => {
    res.status(200).json({ isLoggedIn: true });
});

const WS_MESSAGE_TYPES = {
    ADD: 'ADD_TASK',
    UPDATE: 'UPDATE_TASK',
    DELETE: 'DELETE_TASK'
};

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

wss.on('connection', ws => {
    ws.on('message', message => {
        const data = JSON.parse(message);
        if (data.type === 'draw-line') {
            const { prevPoint, currentPoint } = data;
            wss.clients.forEach(client => {
            if (client !== ws && client.readyState === ws.OPEN) {
                client.send(JSON.stringify({
                type: 'draw-line',
                prevPoint,
                currentPoint
                }));
            }
            });
        } else if (data.type === 'moveTo' || data.type === 'lineTo') {
            const { x, y } = data;
            wss.clients.forEach(client => {
            if (client !== ws && client.readyState === ws.OPEN) {
                client.send(JSON.stringify({
                type: data.type,
                x,
                y
                }));
            }
            });
        }
    });
});

app.get('/api/public/tasks', authenticate, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        const { tasks, totalTasks } = await getTasks(limit, offset);
        // console.log(tasks)
        res.json({
            tasks,
            totalTasks,
            page,
            totalPages: Math.ceil(totalTasks / limit)
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get('/api/private/tasks', authenticate, async (req, res) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 100
    const offset = (page - 1) * limit
    const user_id = req.user.id
    // console.log(user_id)
    try {
        const { tasks, totalTasks } = await getTasksOfAParticularUser(user_id, limit, offset);
        const totalPages = Math.ceil(totalTasks / limit);

        res.json({
            tasks,
            totalTasks,
            page,
            totalPages
        });
    } catch(err) {
        console.log(err)
        res.status(500).send()
    }
})

app.get('/api/user', authenticate, (req, res) => {
    res.send({ user_id: req.user.id });
});

app.get('/api/tasks/:id', authenticate, async (req, res) => {
    const accessToken = req.cookies['access-token'];
    if (accessToken) {
        var decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    }
    else return;
    const id = req.params.id
    // console.log(id)
    // console.log("Decoded id(user id): ", decoded.id)
    
    const user_id = await getUserIdOfTask(id);
    console.log("USER ID:", user_id)
    const role = await getUserRole(decoded.id);
    console.log("ROLE:", role)
    const task_visibility = await getTaskVisibility(id)
    console.log("VISIBILITY:", task_visibility)
    // console.log("User id of task:", user_id)
    if ((user_id == decoded.id || role == 'Admin' || role == 'Manager') && task_visibility != 1) {
        console.log("A AJUNS")
    // if (taskIds.some(task => task.task_id == id)) {
        const task = await getTask(id);
        res.send(task);
    }
    else {
        console.log('Not allowed')
    }
})

app.get('/api/getUsername', authenticate, async (req, res) => {
    const accessToken = req.cookies['access-token'];
    var decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    const username = await getUsernameOfUserWithCertainId(decoded.id);
    // console.log(username);
    res.status(200).send(username);
})

app.get('/api/toggleRegular/:id', authenticate, async (req, res) => {
    const id = req.params.id;
    const user = await changeRoleToRegular(id)
    res.status(200).send(user)
})

app.get('/api/toggleManager/:id', authenticate, async (req, res) => {
    const id = req.params.id;
    const user = await changeRoleToManager(id)
    res.status(200).send(user)
})

app.get('/api/getRoleOfUser/:id', authenticate, async (req, res) => {
    const id = req.params.id;
    const role = await getUserRole(id)
    console.log(role)
    res.status(200).send(role)
})

app.get('/api/getRole', authenticate, async (req, res) => {
    const accessToken = req.cookies['access-token'];
    var decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    // console.log(decoded.role)
    res.status(200).send(decoded.role);
})

app.post('/api/tasks/add', authenticate, async (req, res) => {
    const accessToken = req.cookies['access-token'];
    if (accessToken) {
        var decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    }
    else return;
    
    const { task_name, task_description, task_deadline, user_id, visibility_type } = req.body
    if (user_id == decoded.id) {
        // console.log(task_deadline)
        const task = await createTask(task_name, task_description, task_deadline, user_id, visibility_type)
        wss.clients.forEach((client) => {
            client.send(JSON.stringify({
                type: WS_MESSAGE_TYPES.ADD,
                payload: task,
            }));
        });
        res.status(201).send(task)
    }
    else {
        console.log("No access!")
    }
})

app.get('/api/getNumberOfTasks', authenticate, async (req, res) => {
    try {
        const number = await getNumberOfTasks();
        console.log("NUMBER :", number.COUNT);
        res.status(200).send(number); // Change status code to 200 OK
    } catch (error) {
        console.error('Error getting number of tasks:', error);
        res.status(500).send({ error: 'Internal Server Error' }); // Handle errors appropriately
    }
});

app.delete('/api/users/delete/:id', authenticate, async (req, res) => {
    const id = req.params.id;
    // console.log("USERRRR IDDDD:", id)
    await removeUser(id);
})

app.delete('/api/tasks/delete/:id', authenticate, async (req, res) => {
    const accessToken = req.cookies['access-token'];
    if (accessToken) {
        var decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    }
    else return;
    const id = req.params.id
    const user_id = await getUserIdOfTask(id);
    const role = await getUserRole(decoded.id);
    const task_visibility = await getTaskVisibility(id)
    if ((user_id == decoded.id || role == 'Manager' || role == 'Admin') && task_visibility != 1) {
        await removeTask(id)
        wss.clients.forEach((client) => {
            client.send(JSON.stringify({
                type: WS_MESSAGE_TYPES.DELETE,
                payload: id,
            }));
        });
        res.status(201).send('Task deleted successfuly!')
    }
    else {
        console.log("No access!")
    }
})

app.put('/api/tasks/:id', authenticate, async (req, res) => {
    const accessToken = req.cookies['access-token'];
    if (accessToken) {
        var decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    }
    else return;
    const id = req.params.id
    const { task_name, task_description, task_deadline } = req.body
    // console.log(user_id)
    
    const user_id = await getUserIdOfTask(id);
    const role = await getUserRole(decoded.id)
    const visibility = await getTaskVisibility(id)
    console.log(role)
    if ((user_id == decoded.id || role == 'Admin' || role == 'Manager') && visibility != 1) {
        const updatedTask = await updateTask(id, task_name, task_description, task_deadline)
        wss.clients.forEach((client) => {
            client.send(JSON.stringify({
                type: WS_MESSAGE_TYPES.UPDATE,
                payload: updatedTask,
            }));
        });
        res.status(201).send('Task updated successfuly!')
    }
    else
        res.status(404).send('No access!')
})

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})
app.get('*', (_, res) => res.sendFile('index.html', { root: 'dist' }))
const port = process.env.PORT || 8080
server.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});