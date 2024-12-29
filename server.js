require("dotenv").config();
const connectDataBase = require("./config/database");
const app = require("./app");

connectDataBase();

app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});