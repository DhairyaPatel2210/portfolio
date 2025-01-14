const bcrypt = require("bcrypt");

async function generateHashPassword(plainTextPassword) {
  const saltRounds = parseInt(process.env.HASH_SALT);
  try {
    const hash = await bcrypt.hash(plainTextPassword, saltRounds);
    return hash;
  } catch (error) {
    throw new Error("Error hashing password");
  }
}

module.exports = generateHashPassword;
