import mongoose from 'mongoose';
const { connection } = mongoose;


const userSchema = new mongoose.Schema({
    name: {
      type:  String, 
      required: true
    },
    roomName: {
      type: String,
      required: true
    }
  });


const modelName = "room"
  export default (connection && connection.models[modelName])
  ? connection.models[modelName]
  : mongoose.model(modelName, userSchema);
  