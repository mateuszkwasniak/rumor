import { MongoClient } from "mongodb";

export async function connectToDatabase() {
  let client;
  try {
    client = await MongoClient.connect(process.env.DB_CONNECTION);
  } catch (error) {
    console.log(error);
  }
  return client;
}
