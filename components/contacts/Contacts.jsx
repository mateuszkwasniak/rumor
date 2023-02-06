import React, { useState, useEffect } from "react";
import { BsPerson } from "react-icons/bs";
import classes from "./contacts.module.scss";
import { motion } from "framer-motion";

const Contacts = ({ contacts, onContactClick, newMessages, activeChat }) => {
  const [searchTerm, setSeachTerm] = useState("");
  const [contactsToDisplay, setContactsToDisplay] = useState([]);

  const barVariants = {
    init: { x: -300 },
    finit: {
      x: 0,
      transition: {
        delay: 0.5,
        duration: 1,
      },
    },
  };

  useEffect(() => {
    if (searchTerm === "") {
      setContactsToDisplay(contacts);
    } else {
      const filteredContacts = contacts.filter((contact) =>
        contact.username.includes(searchTerm)
      );
      setContactsToDisplay(filteredContacts);
    }
  }, [searchTerm, contacts]);

 

  return (
    <motion.div
      className={classes.contacts}
      variants={barVariants}
      initial="init"
      animate="finit"
    >
      <input
        className={classes.search}
        placeholder="Find user..."
        value={searchTerm}
        onChange={(e) => {
          setSeachTerm(e.target.value);
        }}
      />
      <hr />
      <motion.ul>
        {contactsToDisplay?.map((contact, idx) => (
          <li
            className={`${
              activeChat !== contact.userID &&
              contact.userID &&
              newMessages.find(
                (newMessage) => newMessage.from === contact.userID
              ) &&
              classes.new
            }`}
            key={idx}
            onClick={() => onContactClick(contact)}
          >
            <div className={classes.top}>
              <BsPerson className={classes.head} />
              <div
                className={classes.online}
                style={{
                  backgroundColor: contact.connected ? "green" : "orange",
                }}
              />
            </div>
            <span>{contact.username}</span>

            <p className={classes.lastMsg}>{`${
              (activeChat !== contact.userID &&
                newMessages
                  .find((newMessage) => newMessage.from === contact.userID)
                  ?.message.slice(0, 6)
                  .concat("...")) ||
              ""
            }`}</p>
          </li>
        ))}
      </motion.ul>
    </motion.div>
  );
};

export default Contacts;
