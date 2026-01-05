const pool = require('../db/db')
const bcrypt = require('bcrypt')

const addUser = async (req, res) => {
    const {username, password, email, user_role} = req.body
    const password_hashed = await bcrypt.hash(password, 10)
    try{
        await pool.query(
            'INSERT INTO users (username, password_hashed, email, user_role) VALUES ($1, $2, $3, $4)',
            [username, password_hashed, email, user_role]
        )
        res.status(200).json({message: "User added"})
    }
    catch(err){
        console.error(err);
        res.status(500).json({message:"Error adding user"})
    }
}

module.exports = { addUser }