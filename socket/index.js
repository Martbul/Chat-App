const { Server } = require("socket.io");
//! when deplying you must change the cors
const io = new Server({ cors:"http://localhost:5173" });

let onlineUsers = []

io.on("connection", (socket) => {
  console.log("new connection",socket.id);

  //listen to a connection
  socket.on("addNewUser", (userId) => {

  })
});

io.listen(3000);