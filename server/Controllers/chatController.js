const chatModel = require("../Models/chatModel");

//Create chat
//Find User Chats
//Find Chat


const createChat = async(req,res) =>{
    const {firstId,secondId} = req.body;

    try {
        const chat = await chatModel.findOne({
            members:{$all:[firstId,secondId]}
        });

        //if chat exist -> send to frontend
        if(chat) return res.status(200).json(chat);


        //if chat doesnt exist -> create new chat
        const newChat = new chatModel({
            members:[firstId,secondId]
        });

        //saving newChat to the dataBase
        const response = await newChat.save();

        //sending newChat to the frontend
        res.status(200).json(response);

        
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};



const findUserChats = async(req,res) =>{
    const userId = req.params.userId;
    try {

        const userChats = await chatModel.find({
            members:{$in:[userId]}
        });

        res.status(200).json(userChats);
        
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};

const findOneUserChat = async(req,res) =>{
    const {firstId, secondId} = req.params;
    try {

        const chat = await chatModel.findOne({
            members:{$all:[firstId,secondId]}
        });

        res.status(200).json(chat);
        
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};

module.exports = {createChat, findUserChats,findOneUserChat}