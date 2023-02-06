import React, { useState, useContext } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession, signOut } from "next-auth/react";
import classes from "./navbar.module.scss";
import { motion } from "framer-motion";
import { RiSendPlane2Line } from "react-icons/ri";
import { roomContext } from "@/store/room-ctx";

const Navbar = () => {
  const { data: session } = useSession();
  const [showRoomInput, setShowRoomInput] = useState(false);
  const [roomInput, setRoomInput] = useState("");
  const router = useRouter();

  const { joinRoom, setRooms } = useContext(roomContext);

  const navbarVariants = {
    init: { y: -200 },
    final: {
      y: 0,
      transition: {
        duration: 1,
        type: "tween",
        when: "beforeChildren",
      },
    },
  };

  const logoVariants = {
    init: { opacity: 0, x: -300 },
    final: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 1,
        type: "tween",
      },
    },
  };

  const buttonVariants = {
    init: { opacity: 0 },
    final: { opacity: 1, transition: { duration: 1 } },
  };

  const formVariants = {
    init: { x: 100, opacity: 0 },
    final: { x: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  const submitFormHandler = (e) => {
    e.preventDefault();
    if (roomInput.trim() !== "") {
      joinRoom(roomInput);
    }
    setRoomInput("");
    setShowRoomInput(false);
  };

  return (
    <motion.div
      variants={navbarVariants}
      className={classes.navbar}
      initial="init"
      animate="final"
    >
      <motion.div className={classes.logo} variants={logoVariants}>
        <Link href={"/"}>
          <h1>
            RUMOR<span className={classes.logoSpan}>{`\xAE`}</span>
          </h1>
        </Link>
      </motion.div>

      {showRoomInput && (
        <motion.form variants={formVariants} onSubmit={submitFormHandler}>
          <input
            key="veryunique"
            placeholder="Enter room's name..."
            value={roomInput}
            onChange={(e) => setRoomInput(e.target.value)}
          ></input>
          <button type="submit" className={classes.submitBtn}>
            <RiSendPlane2Line className={classes.submitIcon} />
          </button>
        </motion.form>
      )}
      {!session && (
        <p className={classes.welcome}>
          Welcome to Rumor - simple chat application
        </p>
      )}
      {session ? (
        <motion.div className={classes.buttons} variants={buttonVariants}>
          <button
            onClick={() => {
              setShowRoomInput((prev) => !prev);
            }}
          >
            Join Room
          </button>
          <button
            onClick={async () => {
              setRooms([]);
              await signOut({
                redirect: false,
              });
              router.replace("/auth/login");
            }}
          >
            Sign Out
          </button>
          <p>
            Logged as:
            <br />
            <span>{session.user.name}</span>
          </p>
        </motion.div>
      ) : (
        <motion.div className={classes.buttons} variants={buttonVariants}>
          <Link href={"/auth/login"}>Sign In</Link>
          <Link href={"/auth/register"}>Register</Link>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Navbar;
