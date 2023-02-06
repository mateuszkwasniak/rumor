import React, { useState, useEffect, useRef, useContext } from "react";
import classes from "./chat.module.scss";
import { motion } from "framer-motion";

import { GrClose } from "react-icons/gr";
import { BsPeople } from "react-icons/bs";
import { useSession } from "next-auth/react";

const Chat = ({
  room = false,
  details,
  onChatClose,
  onActiveChat,
  active,
  onSendMessage,
}) => {
  const [input, setInput] = useState("");
  const [showRoommates, setShowRoommates] = useState(false);
  const { data: session } = useSession();

  const submitMessageHandler = (event) => {
    event.preventDefault();
    if (input.trim() === "") return;
    if (!room) {
      onSendMessage(details.userID, input, setInput);
    } else {
      onSendMessage(details.roomName, input, setInput);
    }
  };

  const containerRef = useRef();
  const chatRef = useRef();

  useEffect(() => {
    if (active) {
      containerRef?.current?.scroll({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });

      chatRef?.current?.scrollIntoView({
        block: "center",
        behavior: "smooth",
      });
    }
  }, [details.messages, active]);

  return (
    <motion.div
      className={`${classes.chat} ${active && classes.activeChat}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onTap={onActiveChat}
      ref={chatRef}
    >
      {showRoommates && (
        <motion.div
          className={classes.roomMates}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {details.mates.map((mate) => (
            <div className={classes.mate} key={mate}>
              {mate}
            </div>
          ))}
          <hr />
        </motion.div>
      )}
      <div className={classes.header}>
        <span>{!room ? details.username : details.roomName}</span>
        <div className={classes.icons}>
          {room && (
            <motion.div
              onHoverStart={(e) => {
                setShowRoommates(true);
              }}
              onHoverEnd={(e) => setShowRoommates(false)}
            >
              <BsPeople />
            </motion.div>
          )}
          <motion.button
            onClick={onChatClose}
            whileHover={{ scale: 1.1 }}
            onPointerDownCapture={(e) => e.stopPropagation()}
          >
            <GrClose />
          </motion.button>
        </div>
      </div>
      <div className={classes.conversation} ref={containerRef}>
        {details.messages.map((message, idx) =>
          !room ? (
            <motion.div
              key={idx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`${classes.message} ${
                !room
                  ? message.from !== details.userID && classes.reverse
                  : message.fromID === session.user.userID && classes.reverse
              }`}
            >
              <p>{message.msg}</p>
            </motion.div>
          ) : message?.marker === "server" ? (
            <div className={classes.serverMessage} key={idx}>
              {message.msg}
            </div>
          ) : (
            <motion.div
              key={idx - 100}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={
                message.fromID === session.user.userID && classes.reverse
              }
            >
              {message.fromID !== session.user.userID && (
                <span>{message.fromName}: </span>
              )}

              <div className={classes.message}>
                <p>{message.msg}</p>
              </div>
            </motion.div>
          )
        )}
      </div>
      <form onSubmit={submitMessageHandler}>
        <input
          autoFocus={true}
          placeholder="Type something..."
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
          }}
        />
        <button>Send</button>
      </form>
    </motion.div>
  );
};

export default Chat;
