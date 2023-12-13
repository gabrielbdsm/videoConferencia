import {connect } from 'mongoose';
import dotenv from "dotenv"

dotenv.config()

export  const mongoConnect = async()=> {
    try{        
        await connect(process.env.DATABASE + "/meet",{

            useNewUrlParser: true,
            useUnifiedTopology: true
        } )
        console.log("Conexão bem-sucedida.")
    }catch(err){
        console.log("Erro: " + err)
    }
}