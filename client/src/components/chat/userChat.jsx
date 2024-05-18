import { Stack } from "react-bootstrap";
import { useFetchRecipientUser } from "../../hooks/useFetchRecipient";
import profilePicMen from "../../assets/profilePicMen.svg"
import { ChatContext } from "../../context/ChatContext";
import { useContext } from "react";
import { unreadNotificationsFunc } from "../../utils/unreadNotifications";

const UserChat = ({ chat, user }) => {
  const { recipientUser } = useFetchRecipientUser(chat, user);
  const {onlineUsers, notifications,markThisUserNotificationAsRead  } = useContext(ChatContext)

  
  const unreadNotifications = unreadNotificationsFunc(notifications)
  //unreadNotifications contains ALL unread notifications, 
  //but here you want to seperate the notifications per chat
  const thisUserNotifications = unreadNotifications?.filter(
    n => n.senderId === recipientUser?._id
  )


  const isOnline = onlineUsers?.some((user) => user?.userId === recipientUser?._id)

  //console.log("recipient:", recipientUser);
  return (
    <Stack
      direction="horizontal"
      gap={3}
      className="user-card align-items-center p-2 justify-content-between"
      role="button"
      onClick={() =>{
        if(thisUserNotifications?.length !== 0){
          markThisUserNotificationAsRead(
            thisUserNotifications,
            notifications
          )
        }
      }}
    >
      <div className="d-flex">
        <div className="me-2">
            <img src={profilePicMen} height="35px" alt="" />
        </div>
        <div className="text-content">
          <div className="name">{recipientUser?.name}</div>

          <div className="text">Ddummy text message</div>
        </div>
      </div>
      <div className="d-flex flex-column align-items-end">
        <div className="date">
            05/12/2023
        </div>
        <div className={thisUserNotifications?.length > 0 ?"this-user-notifications" : ""}>
            {thisUserNotifications?.length > 0
            ? thisUserNotifications?.length
            :""
          }
        </div>
        <span className={isOnline ?"user-online":''}></span>
      </div>
    </Stack>
  );
};

export default UserChat;
