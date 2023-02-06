import { getServerSession } from "next-auth";
import React, { useState, useEffect, useContext } from "react";
import Contacts from "@/components/contacts/Contacts";
import ChatList from "@/components/chatlist/ChatList";
import RoomsBar from "@/components/rooms/RoomsBar/RoomsBar";
import { authOptions } from "./api/auth/[...nextauth]";
import { motion } from "framer-motion";

//socket.io
import io from "socket.io-client";
import { roomContext } from "@/store/room-ctx";

const Home = ({ username, sessionID, userID }) => {
  const [users, setUsers] = useState([]);
  const [privateChats, setPrivateChats] = useState([]);
  const [roomChats, setRoomChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [newMessages, setNewMessages] = useState([]);
  const [newRoomMessages, setNewRoomMessages] = useState([]);
  const [firstContactToDisplay, setFirstContactToDisplay] = useState(null);

  const {
    rooms,
    loadInitialRooms,
    addMessageToTheRoom,
    updateMessages,
    updateRoommates,
    userSocket,
    setUserSocket,
  } = useContext(roomContext);

  const contactClickHandler = (contact) => {
    const inNewMessages = newMessages.find(
      (newMsg) => newMsg.from === contact.userID
    );
    if (inNewMessages) {
      newMessageRemoval(contact.userID);
    }

    const alreadyAdded = privateChats.find((chat) => chat === contact.userID);
    setActiveChat(contact.userID);
    if (alreadyAdded) {
      return;
    }
    setPrivateChats((prev) => [...prev, contact.userID]);
  };

  const roomClickHandler = (roomName) => {
    const alreadyAdded = roomChats.find((roomChat) => roomChat === roomName);

    setActiveChat(roomName);

    if (alreadyAdded) {
      return;
    }
    setRoomChats((prev) => [...prev, roomName]);

    setNewRoomMessages((prev) => prev.filter((room) => room !== roomName));
  };

  //dla <Chat/>
  const chatCloseHandler = (removedID, room = false) => {
    if (!room) {
      setPrivateChats((prev) => {
        const updated = prev.filter((conv) => conv !== removedID);
        return updated;
      });
    } else {
      setRoomChats((prev) => {
        const updated = prev.filter((conv) => conv !== removedID);
        return updated;
      });
    }

    if (activeChat === removedID) {
      setActiveChat(null);
    }
  };

  //dla <Chat/>
  const sendPrivateMessage = (toID, input, setInput) => {
    //dodanie wiadomosci po stronie klienta
    setUsers((prev) => {
      const copied = prev.map((user) => {
        if (user.userID === toID)
          return {
            ...user,
            messages: [
              ...user.messages,
              {
                msg: input,
                from: userID,
                to: toID,
              },
            ],
          };
        else return user;
      });

      return copied;
    });
    //wyslanie wiadomosci na serwer
    userSocket?.volatile?.emit("private-message", input, toID);
    setInput("");
  };

  const sendRoomMessage = (roomName, input, setInput) => {
    userSocket?.volatile?.emit("room-message", input, roomName);
    setInput("");
  };

  //dla Contacts i Chat
  const newMessageRemoval = (from) => {
    setNewMessages((prev) => {
      const updated = prev.filter((newMsg) => newMsg.from !== from);
      return updated;
    });
  };

  useEffect(() => {
    const socket = io("https://socket-chat-server-s22k.onrender.com", {
      autoConnect: false,
    });

    socket.auth = { sessionID, username };
    socket.connect();

    socket.on("connect", () => {
      console.log("Connected to the chat server :)");
    });

    socket.on("allUsers", (users) => {
      const otherUsers = users.filter((user) => user.userID !== userID);
      setUsers(otherUsers);
      setFirstContactToDisplay(otherUsers[0]?.userID || null);
    });

    socket.on("userRooms", (rooms) => {
      loadInitialRooms(rooms);
    });

    socket.on("user-connected", (newUser) => {
      if (newUser.userID === userID) {
        return;
      }
      setUsers((prevUsers) => {
        const userToAdd = prevUsers.find(
          (user) => user.userID === newUser.userID
        );

        if (!userToAdd) {
          const updatedUsers = [...prevUsers, newUser];
          return updatedUsers;
        } else {
          const copiedUsers = [...prevUsers];
          const amended = copiedUsers.find(
            (user) => user.userID === newUser.userID
          );
          amended.connected = true;
          return copiedUsers;
        }
      });
    });

    socket.on("priv", (conversation, lastMessage) => {
      setFirstContactToDisplay(lastMessage.from);
      setNewMessages((prev) => {
        const alreadyIn = prev.find((el) => el.from === lastMessage.from);
        if (alreadyIn)
          return [
            ...prev.filter((el) => el.from !== lastMessage.from),
            { from: lastMessage.from, message: lastMessage.msg },
          ];

        return [
          ...prev,
          {
            from: lastMessage.from,
            message: lastMessage.msg,
          },
        ];
      });

      setUsers((prev) => {
        const copied = prev.map((user) => {
          if (user.userID === lastMessage.from) {
            return { ...user, messages: conversation };
          } else {
            return user;
          }
        });

        return copied;
      });
    });

    socket.on("room", (message) => {
      addMessageToTheRoom(message.roomName, message);
      setNewRoomMessages((prev) => {
        const alreadyIn = prev.find((el) => el === message.roomName);
        if (alreadyIn) return prev;

        return [...prev, message.roomName];
      });
    });

    socket.on("roommates-update", (room, mates) => {
      updateRoommates(room, mates);
    });

    socket.on("room-messages-update", (room, messages) => {
      updateMessages(room, messages);
    });

    socket.on("user-disconnected", (disconnectingUserID) => {
      setUsers((prevUsers) => {
        const updatedUsers = prevUsers.map((user) => {
          if (user.userID === disconnectingUserID) {
            return { ...user, connected: false };
          } else {
            return user;
          }
        });

        return updatedUsers;
      });
    });

    setUserSocket(socket);

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (newMessages.find((message) => message.from === activeChat)) {
      setNewMessages((prev) =>
        prev.filter((message) => message.from !== activeChat)
      );
    }
  }, [newMessages]);

  useEffect(() => {
    if (newRoomMessages.includes(activeChat)) {
      setNewRoomMessages((prev) => prev.filter((room) => room !== activeChat));
    }
  }, [newRoomMessages]);

  useEffect(() => {
    if (firstContactToDisplay === null) return;
    const firstContact = users.find(
      (user) => user.userID === firstContactToDisplay
    );

    setUsers((prev) => [
      firstContact,
      ...prev.filter((user) => user.userID !== firstContactToDisplay),
    ]);
  }, [firstContactToDisplay]);

  return (
    <motion.div
      className="home"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Contacts
        contacts={users}
        onContactClick={contactClickHandler}
        newMessages={newMessages}
        activeChat={activeChat}
      ></Contacts>
      {(privateChats.length > 0 || roomChats.length > 0) && (
        <ChatList
          users={users}
          chats={privateChats}
          roomChats={roomChats}
          onChatClose={chatCloseHandler}
          onSendPrivateMessage={sendPrivateMessage}
          onSendRoomMessage={sendRoomMessage}
          activeChat={activeChat}
          setActiveChat={setActiveChat}
          onMessageRemoval={newMessageRemoval}
        />
      )}
      {rooms.length > 0 && (
        <RoomsBar
          onRoomClick={roomClickHandler}
          newRoomMessages={newRoomMessages}
          activeChat={activeChat}
        />
      )}
    </motion.div>
  );
};

export async function getServerSideProps(context) {
  //tutaj sprawdzamy od razu czy user ma auth cookie w local storage
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: "/auth/login",
        permanent: false,
      },
    };
  } else {
    return {
      props: {
        username: session?.user?.name,
        userID: session?.user?.userID,
        sessionID: session?.user?.sessionID,
      },
    };
  }
}

export default Home;
