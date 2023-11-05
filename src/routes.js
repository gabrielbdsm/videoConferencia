import express  from "express";


const router = express.Router()

router.get('/chat', (req , res ) => {
    res.render('chat.html')
})
router.get('/ping', (req , res ) => {
    res.json({pong: true})
})

export default router