import express, { response } from "express";
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import path from "path";
import router from "./src/routes.js"
import { Server } from "socket.io";

dotenv.config();
const __dirname = path.resolve()
const port = process.env.PORT;
const app = express();
const server = http.createServer(app);

const io = new Server(server)
  
  
app.use(cors())


app.set('view engine', 'html');
app.use(express.static(path.join(__dirname ,'public' )))


app.use(express.json())


app.use('/' ,router)

server.listen(port , () => {
  console.log(`Serve conectado na porta ${port}`);

})



const user = new Object();
let usersConnect = []

io.on("connection" , (socket) =>{

  socket.on("room", (data) =>{
    socket.usuername = data.id;
    usersConnect.push(data.id)
    socket.emit('UsersNaSala' , {
        usersConnect
    })
    socket.broadcast.emit("UsersNaSalaAtualizado" , {
      usersConnect
    })

    socket.on('disconnect', () => {
      
      usersConnect = usersConnect.filter(u => u != socket.usuername)
      socket.broadcast.emit("UsersNaSalaAtualizado" , {
        usersConnect
      })
    
    })

    user.id = socket.id
  })


})


