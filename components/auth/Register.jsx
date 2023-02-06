import React, { useState } from "react";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import classes from "./register.module.scss";

import { motion } from "framer-motion";

const Register = () => {
  const router = useRouter();

  const [signUpData, setSignUpData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [inputError, setInputError] = useState({
    message: "",
    field: "",
  });

  const [serverError, setServerError] = useState(null);

  const [loading, setLoading] = useState(false);

  const wrapperVariants = {
    init: { y: 30, opacity: 0 },
    final: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 1,
        type: "tween",
      },
    },
  };

  const staggerChildrenVariants = {
    anim: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const loadingVariants = {
    anim: {
      y: [0, 10, 0, 10],
      transition: {
        repeat: Infinity,
        repeatType: "reverse",
        duration: 1,
      },
    },
  };

  const registrationSubmitHandler = async (e) => {
    e.preventDefault();
    setInputError(null);
    setServerError(false);
    setLoading(true);

    if (signUpData.username.trim() === "") {
      setLoading(false);
      setInputError({
        message: "Please fill out the username field.",
        field: "username",
      });
      return;
    }

    if (!signUpData.email.includes("@")) {
      setLoading(false);
      setInputError({
        message: "Please use the proper email address.",
        field: "email",
      });
      return;
    }

    if (signUpData.password.trim().length < 6) {
      setLoading(false);
      setInputError({
        message: "Password requires at least 6 signs.",
        field: "password",
      });
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signUpData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      } else {
        const data = await response.json();

        const result = await signIn("credentials", {
          redirect: false,
          email: signUpData.email,
          password: signUpData.password,
        });

        if (!result.error) {
          router.replace("/");
        } else {
          throw new Error(result.error);
        }
      }
    } catch (error) {
      setLoading(false);
      setServerError(error.message);
    }
  };

  const inputChangeHandler = (e) => {
    setSignUpData((prev) => {
      return { ...prev, [e.target.name]: e.target.value };
    });
  };

  return (
    <motion.div
      className={classes.wrapper}
      variants={wrapperVariants}
      initial="init"
      animate="final"
    >
      <form onSubmit={registrationSubmitHandler}>
        <label>Register</label>
        <input
          className={inputError?.field === "username" ? classes.error : null}
          placeholder="Username..."
          type="text"
          name="username"
          value={signUpData.username}
          onChange={inputChangeHandler}
        ></input>
        <input
          className={inputError?.field === "email" ? classes.error : null}
          placeholder="Email..."
          type="email"
          name="email"
          value={signUpData.email}
          onChange={inputChangeHandler}
        ></input>
        <input
          className={inputError?.field === "password" ? classes.error : null}
          placeholder="Password..."
          type="password"
          name="password"
          value={signUpData.password}
          onChange={inputChangeHandler}
        ></input>
        <div>
          {loading ? (
            <motion.div
              className={classes.loader}
              variants={staggerChildrenVariants}
              initial="init"
              animate="anim"
            >
              <motion.div
                className={classes.ball}
                variants={loadingVariants}
              ></motion.div>
              <motion.div
                className={classes.ball}
                variants={loadingVariants}
              ></motion.div>
              <motion.div
                className={classes.ball}
                variants={loadingVariants}
              ></motion.div>
            </motion.div>
          ) : (
            <button type="submit">Register</button>
          )}
          {inputError && <p>{inputError.message}</p>}
          {serverError && <p>{serverError}</p>}
        </div>
      </form>
    </motion.div>
  );
};

export default Register;
