import { Stack } from "react-bootstrap";
import { useFetchRecipientUser } from "../../hooks/useFetchRecipient";
import profilePicMen from "../../assets/profilePicMen.svg"
import { ChatContext } from "../../context/ChatContext";
import { useContext } from "react";

const UserChat = ({ chat, user }) => {
  const { recipientUser } = useFetchRecipientUser(chat, user);
  const {onlineUsers} = useContext(ChatContext)
  const isOnline = onlineUsers?.some((user) => user?.userId === recipientUser?._id)

  //console.log("recipient:", recipientUser);
  return (
    <Stack
      direction="horizontal"
      gap={3}
      className="user-card align-items-center p-2 justify-content-between"
      role="button"
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
        <div className="this-user-notifications">
            2
        </div>
        <span className={isOnline ?"user-online":''}></span>
      </div>
    </Stack>
  );
};

export default UserChat;
