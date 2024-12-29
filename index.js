require("dotenv").config();
import { get, listen } from "./app";
import connectDataBase from "./config/database";

connectDataBase();

get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: "Hello world!",
  });
})

listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});