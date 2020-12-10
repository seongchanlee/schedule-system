const db = require("@config/db/connection").connectDatabase();
const userManager = require("@app/helpers/queryManager/user");
const adminManager = require("@app/helpers/queryManager/admin");

const initialUser = {
  username: "ADMIN",
  password: "Admin123Admin123",
  email: "admin@gfstrong.com",
  phone_number: "000-000-0000",
  first_name: "Super",
  last_name: "User",
  type: "Administrator",
  permission_level: "High"
};

module.exports = async () => {
  const checkAdmins = await adminManager.getActiveAdmins();
  if (checkAdmins.length !== 0) return false;
  await db.beginTransaction();
  try {
    const superUser = await userManager.getUserWithUsername(initialUser.username, true);
    if (superUser.length !== 0) return false;
    const user = await userManager.createUser(initialUser);
    const admin = await adminManager.createAdmin({id: user[0].id});
    await db.commit();
    return user[0];
  } catch (e) {
    await db.rollback();
    throw e;
  }
};