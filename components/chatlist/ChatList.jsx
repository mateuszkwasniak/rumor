import React, { useContext } from "react";
import classes from "./chatlist.module.scss";
import Chat from "../chat/Chat";
import { motion } from "framer-motion";
import { roomContext } from "@/store/room-ctx";

const ChatList = ({
  users,
  chats,
  roomChats,
  onChatClose,
  onSendPrivateMessage,
  onSendRoomMessage,
  activeChat,
  setActiveChat,
  onMessageRemoval,
}) => {
  const { rooms } = useContext(roomContext);

  return (
    <div className={classes.chatlist}>
      {chats.length > 0 && (
        <div className={classes.type}>
          <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            Private Chats:
          </motion.h2>
        </div>
      )}

      {chats.map((chat, idx) => {
        let user = users.find((user) => user.userID === chat);
        if (user) {
          return (
            <Chat
              key={idx}
              details={user}
              onChatClose={() => onChatClose(user.userID)}
              active={activeChat === user.userID}
              onActiveChat={() => {
                setActiveChat(user.userID), onMessageRemoval(user.userID);
              }}
              onSendMessage={onSendPrivateMessage}
            />
          );
        } else return null;
      })}

      {roomChats.length > 0 && (
        <motion.div
          className={classes.type}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h2>Room Chats:</h2>
        </motion.div>
      )}

      {roomChats.map((roomChat, idx) => {
        const roomChatForDisplay = rooms.find(
          (room) => room.roomName === roomChat
        );
        if (roomChatForDisplay) {
          return (
            <Chat
              key={idx}
              room={true}
              details={roomChatForDisplay}
              active={activeChat === roomChat}
              onChatClose={() => {
                onChatClose(roomChat, true);
              }}
              onActiveChat={() => {
                setActiveChat(roomChat);
              }}
              onSendMessage={onSendRoomMessage}
            ></Chat>
          );
        } else return null;
      })}
    </div>
  );
};

export default ChatList;
