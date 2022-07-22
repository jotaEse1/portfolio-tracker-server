const { verify, sign } = require('jsonwebtoken');
const { hash, compare, genSalt } = require('bcryptjs') 
const { body, validationResult } = require('express-validator');
const path = require('path');
require('dotenv').config()
const {sendAccessToken, sendRefreshToken} = require('../helper/helper')

//actions from db
const {connection} = require('../db')

//controllers
const signIn = async (req, res) => {
    let errors = validationResult(req),
        {username, password, email} = req.body;
       
    //checking for errors in email and password
    if(!errors.isEmpty()) return res.json({
        success: true,
        payload: {
            errors: errors.array(),
            status: 500
        }
    })

    try {
        //check if the user exists
        const sqlFindUser = 'SELECT * FROM user WHERE email = ?;'
        const user = await new Promise((resolve, reject) => {
            connection.query(sqlFindUser, [email], (err, user) => {
                if(err) return reject(err)
                resolve(user)
            })
        })
        if(user.length) return res.json({
            success: true, 
            payload: {
                msg: 'User already exists',
                status: 300
            }
        })
    
        //hash password
        const salt = await genSalt()
        password = await hash(password, salt)

        //create new user
        const sqlCreateUser = 'INSERT INTO user(username, email, password, token) VALUES(?,?,?,?);';
        const createdUser = await new Promise((resolve, reject) => {
            connection.query(sqlCreateUser, [username, email, password, "empty"], (err, newUser) => {
                if(err) return reject(err)
                resolve(newUser)
            })
        })
        
        
        res.status(201).json({
            success: true, 
            payload: {
                msg: `Welcome ${username}`,
                createdUser,
                status: 201 
            }
        })
    } catch(error) {
        res.status(500).json({
            success: false, 
            payload: {
                error
            }
        });
    }
}

const logIn = async (req, res) => {
    let errors = validationResult(req),
        {password, email} = req.body;
       
    console.log(password, email)
    //checking for errors in email and password
    if(!errors.isEmpty()) return res.json({
        success: true,
        payload: {
            errors: errors.array(),
            status: 500
        }
    })

    try {
        //find user and compare hash password
        const sqlFindUser = 'SELECT * FROM user WHERE email = ?;'
        const user = await new Promise((resolve, reject) => {
            connection.query(sqlFindUser, [email], (err, user) => {
                if(err) return reject(err)
                resolve(user)
            })
        })
        
        if(!user.length) return res.json({
            success: true, 
            payload: {
                msg: 'Incorrect email or password',
                status: 404
            }
        })
    
        const {password: hashPassword, id, username} = user[0],
            verified = await compare(password, hashPassword);

        if(!verified) return res.json({
            success: true,
            payload: {
                msg: 'Incorrect email or password',
                status: 404
            }
        })
    
        //create access and refresh tokens
        const accessToken = sign({id}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '15m'}),
            refreshToken = sign({id}, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '7d'})
     
        //save refreshToken in database 
        const sqlSaveToken = 'UPDATE user SET token = ? WHERE id = ?;'
        await new Promise((resolve, reject) => {
            connection.query(sqlSaveToken, [refreshToken, id], (err, logged) => {
                if(err) return reject(err)
                resolve(logged)
            })
        })
    
        //send tokens
        sendRefreshToken(res, refreshToken)
        sendAccessToken(res, id, username, accessToken)
        
    } catch(error) {
        res.status(500).json({
            success: false, 
            payload: {
                error
            }
        });
    }

    

}

const checkToken = async (req, res) => {
    const token = req.cookies.refreshtoken
    console.log(token)
  
    //validate if token exists
    if(!token) return res.json({success: true, accessToken: ''})

    //verify token
    let payload;
    try {
        payload = verify(token, process.env.REFRESH_TOKEN_SECRET)
    } catch {
        return res.json({success: true, accesstoken: '' })
    }

    //validate user
    const sqlFindUser = 'SELECT * FROM user WHERE id = ?;',
        user = await new Promise((resolve, reject) => {
            connection.query(sqlFindUser, [payload.id], (err, user) => {
                if(err) return reject(err)
                resolve(user)
            })
        })

    if(!user) return res.json({success: true, accessToken: ''})
    
    const {id, token: dbToken} = user[0];

    if(dbToken !== token) return res.json({success: true, accessToken: ''})

    //create access and refresh tokens
    const accessToken = sign({id}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '15m'}),
        refreshToken = sign({id}, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '7d'})

    //save refreshToken in database 
    const sqlSaveToken = 'UPDATE user SET token = ? WHERE id = ?;'
    await new Promise((resolve, reject) => {
        connection.query(sqlSaveToken, [refreshToken, id], (err, logged) => {
            if(err) return reject(err)
            resolve(logged)
        })
    })

    //send tokens
    sendRefreshToken(res, refreshToken)
    res.json({accessToken})
}

const logOut = async (req, res) => {
    const token = req.cookies.refreshtoken;

    if(!token) return res.json({success: true, msg: 'No token'})

    //find user, i need the _id
    let payload;
    try {
        payload = verify(token, process.env.REFRESH_TOKEN_SECRET)
    } catch (error) {
        return res.json({success: true, msg: 'Something went wrong. Try again later...' })
    }

    //delete token in db
    await User.updateOne({'_id': payload['_id']}, {$set: {'token': ''}})

    //delete cookie
    res.clearCookie('refreshtoken')
    return res.json({success: true, msg: 'Logged out'})
}


module.exports = {signIn, logIn, checkToken, logOut}