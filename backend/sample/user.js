import bcrypt from "bcryptjs";

const users = [
  {
    userName: "firstName",
    password: bcrypt.hashSync("1234", 10),
  },
];

export default users;