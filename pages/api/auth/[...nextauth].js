import CredentialProvider from "next-auth/providers/credentials";
import NextAuth from "next-auth/next";
import { connectToDatabase } from "@/helpers/db";
import { comparePasswords } from "@/helpers/auth";

export const authOptions = {
  secret: process.env.AUTH_SECRET,

  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialProvider({
      async authorize(credentials, req) {
        try {
          const client = await connectToDatabase();
          const user = await client
            .db()
            .collection("users")
            .findOne({ email: credentials.email });

          if (!user) {
            throw new Error("No matching email in the database.");
          }

          const validPassword = await comparePasswords(
            credentials.password,
            user.password
          );

          if (validPassword) {
            return {
              name: user.username,
              email: user.email,
              sessionID: user.sessionID,
              userID: user._id.toString(),
            };
          } else {
            throw new Error("Invalid password.");
          }
        } catch (error) {
          throw new Error(error.message || "Something went wrong...");
        }
      },
    }),
  ],

  callbacks: {
    jwt: async ({ token, user }) => {
      user && (token.user = user);
      return token;
    },
    session: async ({ session, token }) => {
      session.user = token.user;
      return session;
    },
  },
};

export default NextAuth(authOptions);
