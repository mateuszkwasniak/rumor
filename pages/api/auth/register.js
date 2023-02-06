import { connectToDatabase } from "@/helpers/db";
import { hashPassword } from "@/helpers/auth";
import crypto from "crypto";

const randomId = () => {
  return crypto.randomBytes(8).toString("hex");
};

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { username, email, password } = req.body;

    if (
      !email ||
      !email.includes("@") ||
      !username ||
      password.trim().length < 6
    ) {
      res.status(422).json({
        message: "Invalid email or password too short (6 signs at least)",
      });
      return;
    }

    let client;

    try {
      client = await connectToDatabase();
      const resultEmail = await client
        .db()
        .collection("users")
        .findOne({ email: email });

      if (resultEmail) {
        res.status(500).json({ message: "Email already registered." });
        return;
      }

      const resultUsername = await client
        .db()
        .collection("users")
        .findOne({ username: username });

      if (resultUsername) {
        res.status(500).json({ message: "Username already exists." });
        return;
      }

      const hashedPassword = await hashPassword(password);
      // byc moze tutaj trzeba bedzie tez utworzyc unikalna sessionID dla czatu i wyslac ja na serwer czatu zeby zaktualizowal swoja liste aktywnych uzytkowników

      //generujemy sessionID dla chatu
      const sessionID = randomId();

      const response = await client.db().collection("users").insertOne({
        username,
        email,
        password: hashedPassword,
        sessionID,
      });

      //pobieramy zwrocone ID z mongoDB
      const userID = response.insertedId.toString();

      //wysylamy na chat server informacje o nowym uzytkowniku
      const chatServerResponse = await fetch(
        "http://localhost:8080/add-sessionid",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionID,
            userID,
            username,
          }),
        }
      );

      if (!chatServerResponse.ok) {
        throw new Error("Something went wrong...");
      }

      res.status(201).json({
        message: "Account created",
      });
    } catch (error) {
      res.status(500).json({ message: "Something went wrong..." });
    }
  }
}
