import { createContext, useState } from "react";

export const roomContext = createContext({
  //rooms bedzie tablica w ktorej beda znajdywaly sie nazwy pokojów do których należy użytkownik
  userSocket: {},
  rooms: [],
  joinRoom: () => {},
});

const RoomContextProvider = ({ children }) => {
  const [userSocket, setUserSocket] = useState({});
  const [rooms, setRooms] = useState([]);

  const loadInitialRooms = (serverRooms) => {
    console.log(serverRooms);
    setRooms(serverRooms || []);
  };
  const joinRoom = (roomName) => {
    if (!rooms.find((room) => room.roomName === roomName)) {
      setRooms((rooms) => [...rooms, { roomName, messages: [], mates: [] }]);
      userSocket?.emit("join-room", roomName);
    } else console.log("You have already joined this room");
  };

  const leaveRoom = (roomName) => {
    setRooms((rooms) => rooms.filter((room) => room.roomName !== roomName));
  };

  const addMessageToTheRoom = (roomName, msg) => {
    setRooms((prev) => {
      const copied = prev.map((room) => {
        if (room.roomName === roomName)
          return {
            ...room,
            messages: [
              ...room.messages,
              {
                ...msg,
              },
            ],
          };
        else return room;
      });

      return copied;
    });
  };

  const updateMessages = (roomName, messages) => {
    setRooms((prev) => {
      const copied = prev.map((room) => {
        if (room.roomName === roomName)
          return {
            ...room,
            messages: messages,
          };
        else return room;
      });

      return copied;
    });
  };

  const updateRoommates = (roomName, mates) => {
    setRooms((prev) => {
      const copied = prev.map((room) => {
        if (room.roomName === roomName)
          return {
            ...room,
            mates,
          };
        else return room;
      });

      return copied;
    });
  };

  return (
    <roomContext.Provider
      value={{
        rooms,
        setRooms,
        loadInitialRooms,
        joinRoom,
        leaveRoom,
        addMessageToTheRoom,
        updateMessages,
        updateRoommates,
        userSocket,
        setUserSocket,
      }}
    >
      {children}
    </roomContext.Provider>
  );
};

export default RoomContextProvider;
