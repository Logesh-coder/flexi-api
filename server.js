require("dotenv").config();
const connectDataBase = require("./config/database");
const app = require("./app");

connectDataBase();

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: "Hello world!",
  });
})

app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});