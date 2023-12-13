import router from "./src/routes.js"
import {mongoConnect} from "./src/database/mongodb.js"

import {userDisconnect, usersSelect ,userSalver } from "./src/controllers/roomController.js"

import express, { response } from "express";
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
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
    console.log(socket.rooms)
    let usersConnect = await usersSelect(data.selectRoom)
    
    
    const rooms = Array.from(socket.rooms.values()).filter(room => room !== socket.id);
    io.to(rooms).emit("UsersNaSala", {
      usersConnect
    })
    // socket.emit('UsersNaSala' , {
    //     usersConnect
    // })
    // socket.broadcast.emit("UsersNaSalaAtualizado" , {
    //   usersConnect
    // })

    socket.on('disconnect', async() => {
      
      userDisconnect(socket.username , data.selectRoom)
      usersConnect = await usersSelect(data.selectRoom);
      usersConnect = usersConnect.filter(u => u !== socket.username);
      io.to(data.selectRoom).emit("UsersNaSala", {
        usersConnect
      })
    })

    
  })


})


