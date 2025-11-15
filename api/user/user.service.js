import { loggerService } from "../../services/logger.service.js";
import { makeId, readJsonFile, writeJsonFile } from "../../services/utils.js";

const users = readJsonFile("./data/users.json");
export const UserService = {
  query,
  getById,
  getByUser,
  save,
  remove,
};

async function query(filterBy = {}) {
  try {
    return users;
  } catch (err) {
    loggerService.error("Cannot get users: ", err);
    throw err;
  }
}

async function getById(userId) {
  try {
    const userToReturn = users.find((user) => user._id === userId);
    if (!userToReturn) throw new Error("Cannot find userby id");
    return userToReturn;
  } catch (err) {
    loggerService.error(`cannot find user id : ${userId}`, err);
    throw err;
  }
}

async function getByUser(username) {
  try {
    const user = await users.find((user) => user.username === username);
    return user;
  } catch (err) {
    loggerService.error("cannot get user by username", err);
    throw err;
  }
}

async function save(userToSave) {
  try {
    if (userToSave._id) {
      const userIdx = users.findIndex((user) => user._id === userToSave._id);
      if (userIdx < 0) throw new Error("Cannot find user");
      users[userIdx] = userToSave;
    } else {
      userToSave._id = makeId();
      userToSave.isAdmin = false;
      userToSave.score = 20;
      users.push(userToSave);
    }
    await _saveUserToFile();
    return userToSave;
  } catch (err) {
    loggerService.error("Cannot save user ", err);
    throw err;
  }
}

async function remove(userId) {
  try {
    const userIdx = users.findIndex((user) => user._id === userId);
    if (!userIdx) throw new Error(`Cannot remove user ${userId}`);
    users.splice(userIdx, 1);
    _saveUserToFile();
  } catch (err) {}
}

function _saveUserToFile() {
  writeJsonFile("./data/users.json", users);
}
