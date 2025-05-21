const express = require('express')
const { Server } = require('socket.io')
const http = require('http');
const getUserDetailFromToken = require('../helpers/getUserDetailFromToken');
const UserModel = require('../models/UserModel');
const { ConversationModel, MessageModel } = require('../models/ConversationModel');
const getConversation = require('../helpers/getConversation')
// const { Socket } = require('net');

const app = express();

//socket connection
const server = http.createServer(app);

const io = new Server(server, {
    cors: {

        origin: process.env.FRONTEND_URL,   // Allow requests from this origin
        credentials: true
    }
})


// socket running at http://localhost:8080/

//online user
const onlineUser = new Set();

io.on('connection', async (socket) => {
    // console.log("connected user ", socket.id);

    const token = socket.handshake.auth.token;
    // console.log("Received Token:", token);

    //current user details
    const user = await getUserDetailFromToken(token);
    // console.log("User fetched from token:", user);


    //create a room for the user
    const userId = user?._id?.toString();  // Convert ObjectId to string
    socket.join(user?._id?.toString())
    onlineUser.add(user?._id?.toString());
    // console.log(" User added to online users:", user._id);

    //for sending client side user will be online
    io.emit('onlineUser', Array.from(onlineUser))



    socket.on('message-page', async (userId) => {
        // console.log(' Received userId in backend:', userId); // Check if it's received correctly

        if (!userId) {
            console.log(" No userId received!");
            return;
        }

        try {
            const userDetails = await UserModel.findById(userId).select('-password');
            // console.log(" Fetched User Details:", userDetails);

            if (!userDetails) {
                // console.log(" User not found for ID:", userId);
                return;
            }

            const payload = {
                _id: userDetails._id,
                name: userDetails.name,
                email: userDetails.email,
                profile_pic: userDetails.profile_pic,
                online: onlineUser.has(userId),
            };

            // console.log(" Emitting user details:", payload);
            socket.emit('message-user', payload);

            //get previous message
            // for get conversation 
            const getConversationMessage = await ConversationModel.findOne({
                "$or": [

                    { sender: user?._id, receiver: userId },
                    { sender: userId, receiver: user?._id },
                ]
            }).populate('messages').sort({ updatedAt: -1 })



            socket.emit('message', getConversationMessage?.messages || [])


        } catch (error) {
            console.log(" Error fetching user details:", error);
        }
    });


    // new message 
    socket.on('new message', async (data) => {

        //check conversation is available both user

        let conversation = await ConversationModel.findOne({
            "$or": [

                { sender: data?.sender, receiver: data?.receiver },
                { sender: data?.receiver, receiver: data?.sender },
            ]
        })

        //if conversation is not available
        if (!conversation) {
            const createConversation = await ConversationModel({
                sender: data?.sender,
                receiver: data?.receiver
            })
            conversation = await createConversation.save()
        }

        const message = new MessageModel({
            text: data.text,
            imageUrl: data.imageUrl,
            videoUrl: data.videoUrl,
            msgByUserId: data?.msgByUserId,
        })
        const saveMessage = await message.save();

        // for update conversation 
        const updateConversation = await ConversationModel.updateOne({ _id: conversation?._id }, {
            "$push": { messages: saveMessage?._id }
        })

        // for get conversation 
        const getConversationMessage = await ConversationModel.findOne({
            "$or": [

                { sender: data?.sender, receiver: data?.receiver },
                { sender: data?.receiver, receiver: data?.sender },
            ]
        }).populate('messages').sort({ updatedAt: -1 })


        // console.log("getConversationMessage", getConversationMessage)

        io.to(data?.sender).emit('message', getConversationMessage?.messages || [])
        io.to(data?.receiver).emit('message', getConversationMessage?.messages || [])

        //send Conversation
        const conversationSender = await getConversation(data?.sender)
        const conversationReceiver = await getConversation(data?.receiver)


        io.to(data?.sender).emit('conversation', conversationSender)
        io.to(data?.receiver).emit('conversation', conversationReceiver)

    })



    // console.log("user", user)

    //sidebar
    socket.on('sidebar', async (currentUserId) => {
        // console.log("current user", currentUserId)
        const conversation = await getConversation(currentUserId)
        socket.emit('conversation', conversation)


    })

    //seen

    socket.on('seen', async (msgByUserId) => {
        let conversation = await ConversationModel.findOne({
            "$or": [

                { sender: user?._id, receiver: msgByUserId },
                { sender: msgByUserId, receiver: user?._id },
            ]
        })

        const conversationMessageById = conversation?.messages || []

        const updateMessages = await MessageModel.updateMany(
            { _id: { "$in": conversationMessageById }, msgByUserId : msgByUserId },
            { "$set" : {seen:true}}
        )

         //send Conversation
         const conversationSender = await getConversation(user?._id?.toString())
         const conversationReceiver = await getConversation(msgByUserId)
 
 
         io.to(user?._id?.toString()).emit('conversation', conversationSender)
         io.to(msgByUserId).emit('conversation', conversationReceiver)
    })
    //disconnect

    socket.on('disconnect', () => {
        onlineUser.delete(user?._id)
        console.log('disconnect user', socket.id)
    })
})

module.exports = {
    app,
    server
}
