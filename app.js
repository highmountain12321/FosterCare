import express from "express";
import colors from "colors";
import dotenv from "dotenv";
import cors from "cors";
import { errorHandler, unknownEndpoints } from "./middleware/error";
import connectDb from "./config/db";

const app = express();

dotenv.config({ path: "./config/.env" });

connectDb();

//routes
import authRouter from "./routes/auth";

app.use(express.json());
app.use(cors());

app.use("/api/v1/auth", authRouter);

app.use(unknownEndpoints);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

//Handle unhandle promise rejection

process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red.bold);
  //close the server
  server.close(() => process.exit(1));
});
