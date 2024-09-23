const User = require("../models/user");
module.exports = {
  //   hello() {
  //     return {
  //       text: "Hello world!!",
  //       view: 121,
  //     };
  //   },
  createUser: async ({ userInput }, req) => {
    const existUser = await User.findOne({ email: userInput.email });
    if (existUser) {
      const error = new Error("User already exists in DB!!");
      throw error;
    }
  },
};
