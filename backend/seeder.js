import connectDB from "./config/db.js";
import User from "./models/userModel.js";
import users from "./sample/user.js";
import "dotenv/config";
await connectDB();

const importData = async () => {
  try {
    await User.deleteMany();
    const newUsers = await User.insertMany(users);

    console.log("New data added!");
    process.exit();
  } catch (error) {
    console.log(error);
    process.exit();
  }
};

importData();