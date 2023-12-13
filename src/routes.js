import express  from "express";
import {userSalver} from "./controllers/roomController.js"

const router = express.Router()
router.post("/" , (req , res ) => {
    const {username , selectRoom} = req.body
    res.redirect(`/chat?username=${username}&selectRoom=${selectRoom}`);
}) 
router.get('/chat',userSalver)
router.get('/ping', (req , res ) => {
    res.json({pong: true})
})

export default router