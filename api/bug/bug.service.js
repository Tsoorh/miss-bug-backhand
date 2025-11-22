import { loggerService } from "../../services/logger.service.js";
import {
  makeId,
  readJsonFile,
  writeJsonFile,
  writePDF,
} from "../../services/utils.js";
import { dbService } from "../../services/db.service.js";
import { Collection, ObjectId } from "mongodb";
import { setupAsyncLocalStorage } from "../../middlewares/setupAls.middleware.js";
import { asyncLocalStorage } from "../../services/als.service.js";


const COLLECTION = 'bug'
const PAGE_SIZE = 4;

export const bugService = {
  query,
  getById,
  remove,
  save,
  createPDF,
  getThreeIds,
};

async function query(filterBy = {}, sortBy = {}) {


  try {
    const criteria = _buildCriteria(filterBy)
    const sort = _buildSort(sortBy)
    const collection = await dbService.getCollection(COLLECTION)
    let bugsCurser = await collection.find(criteria, { sort }) 

    if (filterBy?.pageIdx !== undefined) {
      const pagination = _buildPagination(pageIdx)
      bugsCurser = await bugs.skip(pagination.skip).limit(pagination.limit)
    }
    const bugs = await bugsCurser.toArray();

    return bugs
  } catch (err) {
    loggerService.error(err);
    throw err;
  }
}
async function getById(bugId) {
  try {
    const collection = await dbService.getCollection(COLLECTION)
    const criteria = { _id: ObjectId.createFromHexString(bugId) }
    let bug = await collection.findOne(criteria)
    if (!bug) throw new Error("Cannot find bug");
    return bug;
  } catch (err) {
    loggerService.error(err);
    throw err;
  }
}
async function remove(bugId) {
  const { loggedinUser } = asyncLocalStorage.getStore()
  const { _id: creatorId, isAdmin } = loggedinUser

  try {
    const collection = await dbService.getCollection(COLLECTION)
    const criteria = { _id: ObjectId.createFromHexString(bugId) }

    if (!isAdmin) criteria["creator._id"] = ObjectId.createFromHexString(creatorId);


    const res = await collection.deleteOne(criteria)

    if (res.deletedCount === 0) throw new Error(`Only the creator can delete bug!`)

    return bugId;
  } catch (err) {
    loggerService.error(err);
    throw err;
  }
}

async function save(bugToSave) {
  const { loggedinUser } = asyncLocalStorage.getStore();
  const { _id: creatorId, isAdmin } = loggedinUser;

  try {
    const collection = await dbService.getCollection(COLLECTION);
    if (bugToSave._id) {


      if (!(bugToSave.creator._id === creatorId || isAdmin)) throw new Error('Not your bug!')
      const criteria = { _id: ObjectId.createFromHexString(bugToSave._id) } // not sure if already in HexString... test soon
      
      const { _id, ...bugWithoutId } = bugToSave
      const setBug = { $set: bugWithoutId }
      const res = await collection.updateOne(criteria, setBug)

      if (res.modifiedCount === 0) throw new Error('Couldnt update bug')
        
      bugToSave._id = _id;
    } else {
      const res = await collection.insertOne(bugToSave)
      if (res.acknowledged) bugToSave["_id"] = res.insertedId;
    }

    return bugToSave;
  } catch (err) {
    loggerService.error(err);
    throw err;
  }
}

async function createPDF(res) {
  let table = { headers: [], rows: [] };
  const collection = await dbService.getCollection(COLLECTION)
  const bugs = await collection.find({});
  if (bugs.length === 0) {
    throw new Error("No bugs to export");
  }
  bugs.forEach((bug) => {
    let keys = Object.keys(bug);
    keys.forEach((key) => {
      if (!table.headers.includes(key)) table.headers.push(key);
    });
    table.rows.push(Object.values(bug));
  });
  return writePDF(table, res);
}
async function getThreeIds() {
  const b3 = bugs.slice(0, 3);
  const b3Id = b3.map((b) => b._id);

  return b3Id;
}

function _saveBugToFile() {
  writeJsonFile("./data/bugs.json", bugs);
}

function _checkPermission(userId, bugUserId) {
  return userId === bugUserId;
}

function _buildCriteria(filterBy = {}) {
  const criteria = {};
  if(filterBy.txt){
    const txtCriteria = { $regex: filterBy?.txt, $options: 'i' }
    criteria.$or = [{
      username: txtCriteria
    },{
      fullname: txtCriteria
    }]
  }
  if (filterBy.severity){
    criteria.severity = { $gte: filterBy?.severity }
  }
  if(filterBy.ownerId){
    criteria.creator._id = filterBy.ownerId
  }
  return criteria
}

function _buildSort(sort) {
  if (!sort.sortBy) return {}
  return { [sort.sortBy]: sort.sortDir }
}

function _buildPagination(pageIdx) {
  return ({
    skip: (PAGE_SIZE * pageIdx),
    limit: PAGE_SIZE
  })
}




