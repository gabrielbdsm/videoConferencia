import userSchema from "../model/user.js"

export const usersSelect = async  (selectRoom)=>{
    const usersInRoom = await userSchema.find({ roomName: selectRoom })
    const userNames = usersInRoom.map(user => user.name);
    return  userNames
}

export  const userSalver = async  (req , res )=>{
    const { username, selectRoom } = req.query;
        
    try {
        
        if (await userSchema.findOne({roomName : selectRoom}) == null){
            const user = new userSchema({
                name: username,
                roomName:selectRoom
            })
            await user.save()
            return res.render('chat');
        }
        const usuario = await userSchema.findOne({name : username ,roomName : selectRoom})
        if (usuario ==null){
            const user = new userSchema({
                name: username,
                roomName:selectRoom
            })
            await user.save()
            return res.render('chat');
        }else{
            return res.status(400).json({ error: 'Usuário já existe na sala' });

        }
    } catch (error) {
        console.error("Erro ao verificar se usuário existe na sala." ,error)
    }
    res.render('chat');
}

export const userDisconnect = async  (name , roomName )=>{
    const userToDelete = { name  ,roomName  }
    await userSchema.deleteOne(userToDelete)
}