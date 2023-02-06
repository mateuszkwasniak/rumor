import React, { useState } from "react";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import classes from "./register.module.scss";

const Login = () => {
  const router = useRouter();

  const [loginData, setLoginData] = useState({
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

  const loginSubmitHandler = async (e) => {
    e.preventDefault();
    setInputError(null);
    setServerError(null);
    setLoading(true);

    if (!loginData.email.includes("@")) {
      setLoading(false);
      setInputError({
        message: "Please use the proper email address.",
        field: "email",
      });
      return;
    }

    if (loginData.password.trim().length < 6) {
      setLoading(false);
      setInputError({
        message: "Password requires at least 6 signs.",
        field: "password",
      });
      return;
    }

    try {
      const response = await signIn("credentials", {
        redirect: false,
        email: loginData.email,
        password: loginData.password,
      });

      if (!response.error) {
        router.replace("/");
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      setLoading(false);
      setServerError(error.message);
    }
  };

  const inputChangeHandler = (e) => {
    setLoginData((prev) => {
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
      <form onSubmit={loginSubmitHandler}>
        <label>Sign in</label>
        <input
          className={inputError?.field === "email" ? classes.error : null}
          placeholder="Email..."
          type="email"
          name="email"
          value={loginData.email}
          onChange={inputChangeHandler}
        ></input>
        <input
          className={inputError?.field === "password" ? classes.error : null}
          placeholder="Password..."
          type="password"
          name="password"
          value={loginData.password}
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
            <button type="submit">Sign in</button>
          )}

          {inputError && <p>{inputError.message}</p>}
          {serverError && <p>{serverError}</p>}
        </div>
      </form>
    </motion.div>
  );
};

export default Login;
