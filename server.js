import router from "./src/routes.js"
import {mongoConnect} from "./src/database/mongodb.js"

import {userDisconnect, usersSelect ,userSalver } from "./src/controllers/roomController.js"

import express, { response } from "express";
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import https from 'https';
import path from "path";
import { Server } from "socket.io";
import bodyParser from 'body-parser';
import { createRequire } from "module";
const require = createRequire(import.meta.url);


dotenv.config();
mongoConnect()


const __dirname = path.resolve()
const port = process.env.PORT;
const app = express();

const server = http.createServer(app);


const io = new Server(server)
  
  
app.use(cors())

app.use(express.static(path.join(__dirname ,'public' )))
app.set('views', path.join(__dirname, 'public'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json())


app.use('/' ,router)

server.listen(port , () => {
  console.log(`Server conectado na porta ${port}.`);

})



io.on("connection" , (socket) =>{

  socket.on("room", async(data) =>{
    socket.username = data.id
    socket.join(data.selectRoom)
    const rooms = Array.from(socket.rooms.values()).filter(room => room !== socket.id);
    let usersConnect = await usersSelect(rooms[0])
    
    
    io.to(rooms[0]).emit("UsersNaSala", {
      usersConnect
    })

    socket.on('disconnect', async() => {
      
      user+Disconnect(socket.username , data.selectRoom)
      usersConnect = await usersSelect(data.selectRoom);
      usersConnect = usersConnect.filter(u => u !== socket.username);
      io.to(rooms[0]).emit("UsersNaSala", {
        usersConnect
      })
    })
    socket.on('limpartela', (username) => {
      console.log(username)
      io.to(rooms[0]).emit("userLimpaTela", {
        username
      })
    })
    
  })


})


