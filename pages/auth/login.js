import React from "react";
import Login from "@/components/auth/Login";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";

const LoginPage = ({ loggedIn }) => {
  if (!loggedIn) return <Login />;
};

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      loggedIn: false,
    },
  };
}
export default LoginPage;
