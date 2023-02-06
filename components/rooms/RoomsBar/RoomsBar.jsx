import { roomContext } from "@/store/room-ctx";
import React, { useContext } from "react";
import { BsHouse } from "react-icons/bs";
import classes from "./roomsbar.module.scss";
import { motion } from "framer-motion";

const RoomsBar = ({ onRoomClick, newRoomMessages, activeChat }) => {
  const { rooms } = useContext(roomContext);

  const barVariants = {
    init: { x: 300 },
    finit: {
      x: 0,
      transition: {
        duration: 1,
      },
    },
  };

  return (
    <motion.div
      className={classes.roomsBar}
      variants={barVariants}
      initial="init"
      animate="finit"
    >
      <h2>Rooms</h2>
      <motion.ul>
        {rooms?.map((room, idx) => (
          <li
            key={idx}
            onClick={() => {
              onRoomClick(room.roomName);
            }}
          >
            <BsHouse
              className={classes.head}
              style={{
                color:
                  newRoomMessages.includes(room.roomName) &&
                  activeChat !== room.roomName &&
                  "orange",
              }}
            ></BsHouse>
            <span>{room.roomName}</span>
          </li>
        ))}
      </motion.ul>
    </motion.div>
  );
};

export default RoomsBar;
