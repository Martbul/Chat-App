import { createContext, useCallback, useEffect, useState } from "react";
import { getRequest, baseUrl, postRequest } from "../utils/services";
import { io } from "socket.io-client";

export const ChatContext = createContext();

export const ChatContextProvider = ({ children, user }) => {
  const [userChats, setUserChats] = useState(null);
  const [potentialChats, setPotentialChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [userChatsError, setUserChatsError] = useState(null);
  const [isUserChatsLoading, setIsUserChatsLoading] = useState(false);
  const [messages, setMessages] = useState(null);
  const [messagesError, setMessagesError] = useState(null);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [sendTextMessageError, setSendTextMessageError] = useState(null);
  const [newMessage, setNewMessage] = useState(null);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [allUsers, setAllUsers] = useState([]);


  //inital socket
  useEffect(() => {
    const newSocket = io("https://chat-app-socket-io-server-a0b6.onrender.com");
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  //add online users
  useEffect(() => {
    if (socket === null) return;
    socket.emit("addNewUser", user?._id);
    socket.on("getOnlineUsers", (res) => {
      setOnlineUsers(res);
    });

    return () => {
      socket.off("getOnlineUsers");
    };
  }, [socket]);

  //live message sending
  useEffect(() => {
    if (socket === null) return;

    const recipientId = currentChat?.members?.find((id) => id !== user?._id);
    socket.emit("sendMessage", { ...newMessage, recipientId });
  }, [newMessage]);

  //receive message + notification
  useEffect(() => {
    if (socket === null) return;

    socket.on("getMessage", (res) => {
      if (currentChat?._id !== res.chatId) return; //this prevents updating the wrong chat

      setMessages((prev) => [...prev, res]);
    });

    socket.on("getNotification", (res) => {
      //if chat is open(current chat), then the notification will be marked as read and will not be shown
      const isChatOpen = currentChat?.members.some((id) => id === res.senderId);

      if (isChatOpen) {
        setNotifications((prev) => [{ ...res, isRead: true }, ...prev]);
      } else {
        setNotifications((prev) => [res, ...prev]);
      }
    });

    return () => {
      socket.off("getMessage");
      socket.off("getNotification");
    };
  }, [socket, currentChat]);

  useEffect(() => {
    const getUsers = async () => {
      const response = await getRequest(`${baseUrl}/users`);

      if (response.error) {
        return console.log("Error fetching users", response);
      }

      const pChats = response.filter((u) => {
        let isChatCreated = false;
        if (user?._id === u._id) return false;

        //checking if the user already has a chat with the first or the second member of the chat, if so the chat will not be out in the potentioal chat array
        if (userChats) {
          isChatCreated = userChats?.some((chat) => {
            return chat.members[0] === u._id || chat.members[1] === u._id;
          });
        }

        return !isChatCreated;
        // the idea is that: if the user that is currently logged in hasn't got a chat with someone
        //from the DB, that person will be added to pChats array and later listed as potential chat

        //potentialChats is an array with all the users from our DB,
        //exept the logged in user and the users from the chats he has already created
      });

      setPotentialChats(pChats);
      setAllUsers(response);
    };

    getUsers();
  }, [userChats]); //when the user's chats changes(he has some new chat with someone), the useEffect will be triggerd

  useEffect(() => {
    const getUserChats = async () => {
      if (user?._id) {
        setIsUserChatsLoading(true);
        setUserChatsError(null);

        const response = await getRequest(`${baseUrl}/chats/${user?._id}`);
        setIsUserChatsLoading(false);
        if (response.error) {
          return setUserChatsError(response);
        }

        setUserChats(response);
      }
    };

    getUserChats();
  }, [user,notifications]); //every time the user changes this will rerender the component and we can get his chats

  useEffect(() => {
    const getMessages = async () => {
      setIsMessagesLoading(true);
      setMessagesError(null);

      const response = await getRequest(
        `${baseUrl}/messages/${currentChat?._id}`
      );
      setIsMessagesLoading(false);
      if (response.error) {
        return setMessagesError(response);
      }

      setMessages(response);
    };

    getMessages();
  }, [currentChat]);

  const sendTextMessage = useCallback(
    async (textMessage, sender, currentChatId, setTextMessage) => {
      if (!textMessage) return console.log("You must type something");

      const response = await postRequest(
        `${baseUrl}/messages`,
        JSON.stringify({
          chatId: currentChatId,
          senderId: sender._id,
          text: textMessage,
        })
      );

      if (response.error) {
        return setSendTextMessageError(response);
      }

      setNewMessage(response);
      setMessages((prev) => [...prev, response]); //adding the new message to the array of messages(previous message + new message)
      setTextMessage("");
    },
    []
  );

  const updateCurrentChat = useCallback((chat) => {
    setCurrentChat(chat);
  }, []);

  const createChat = useCallback(async (firstId, secondId) => {
    const response = await postRequest(
      `${baseUrl}/chats`,
      JSON.stringify({
        firstId,
        secondId,
      })
    );

    if (response.error) {
      return console.log("Error occured when creating new chat", response);
    }

    setUserChats((prev) => [...prev, response]);
  }, []);

  const markAllNotificationsAsRead = useCallback((notifications) => {
    const mNotifications = notifications.map((n) => {
      return { ...n, isRead: true };
    });

    setNotifications(mNotifications);
  }, []);





  const markNotificationAsRead = useCallback((n,userChats,user,notifications)=>{ // n is current notification
    //find chat to open
    const desiredChat =userChats.find((chat)=>{
      const chatMembers = [user._id, n.senderId]

      //this code iterates over every chat the user has had 
      //and when it finds a chat with him 
      //and the n.senderId this is the desiredChat(the chat the user 
      //has clicked in the notification bar and wants to open to see the notification)
      const isDesiredChat = chat?.members.every((member) =>{ 
        return chatMembers.includes(member);
      });
      //isDesiredChat is a boolean

      return isDesiredChat
    });

    //mark notification as read
    const mNotifications = notifications.map(el =>{
      if(n.senderId === el.senderId){
        return {...n, isRead:true}
      }else{
        return el
      }
    })

    updateCurrentChat(desiredChat);
    setNotifications(mNotifications);
  },[])


  const markThisUserNotificationAsRead = useCallback((thisUserNotification, notifications) => {
    //mark notification as read per chat

    const mNotifications = notifications.map((el) =>{
      let notification;
      thisUserNotification.forEach(n =>{
        if(n.senderId === el.senderId){
          notification = {...n,isRead:true}
        }else{
          notification = el;
        }
      })

      return notification
    })

    setNotifications(mNotifications)
  },[])

  return (
    <ChatContext.Provider
      value={{
        userChats,
        isUserChatsLoading,
        userChatsError,
        potentialChats,
        createChat,
        updateCurrentChat,
        currentChat,
        messages,
        messagesError,
        isMessagesLoading,
        sendTextMessage,
        onlineUsers,
        notifications,
        allUsers,
        markAllNotificationsAsRead,
        markNotificationAsRead,
        markThisUserNotificationAsRead
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
