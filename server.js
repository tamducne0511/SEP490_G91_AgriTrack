require("dotenv").config();
const app = require("./app");
const DbConfig = require("./configs/db");

const PORT = process.env.PORT || 3000;

DbConfig.connectDB();

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
