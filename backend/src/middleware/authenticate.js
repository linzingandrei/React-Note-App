import jwt from 'jsonwebtoken'
import { getUserRole } from '../database/database.js'

function authenticate(req, res, next) {
    const token = req.cookies['access-token'];
    // console.log(token)
    if (token == null) 
        return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        // console.log("DA")
        if (err) {
            console.log(err)
            return res.sendStatus(403); }

        // getUserRole(user.id).then(
        // res => {
        //     // console.log(res)
        //     if(res === 'ADMIN')
        //         user.role = res
        //     else
        //         user.role = res
        //     console.log(user)
        req.user = user;
        next();
        // })
    });
}

export default authenticate