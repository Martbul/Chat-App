const { Server } = require("socket.io");
//! when deplying you must change the cors
const io = new Server({ cors: "http://localhost:5173" });

let onlineUsers = []

io.on("connection", (socket) => {
    console.log("new connection", socket.id);

    //listen to a connection
    socket.on("addNewUser", (userId) => {
        //if the ids are eaqual -> the user is already online and the method "some" will return true 
        //and if it returns true we will not push the user into the array(cause he already is there)
        !onlineUsers.some(user => user.userId === userId) &&

            onlineUsers.push({ userId, socketId: socket.id })
        console.log("onlineUsers", onlineUsers);


        io.emit("getOnlineUsers", onlineUsers);

    })

    socket.on("disconnect", () => {
        onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
        io.emit("getOnlineUsers", onlineUsers);

    })
});

io.listen(3000);