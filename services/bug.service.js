import { loggerService } from "./logger.service.js";
import { makeId, readJsonFile, writeJsonFile,writePDF} from "./utils.js";

export const bugService = {
  query,
  getById,
  remove,
  save,
  createPDF,
  getThreeIds
};

const bugs = readJsonFile("./data/bugs.json");

async function query(filterBy = {}) {
  try {
    return bugs;
  } catch (err) {
    loggerService.error(err);
    throw err;
  }
}
async function getById(bugId) {
  try {
    const bug = bugs.find((bug) => bug._id === bugId);
    if (!bug) throw new Error("Cannot find bug");
    return bug;
  } catch (err) {
    loggerService.error(err);
    throw err;
  }
}
async function remove(bugId) {
  try {
    const bugIdx = bugs.findIndex((bug) => bug._id === bugId);
    if (bugIdx < 0) throw new Error("Cannot find bug to remove");
    bugs.splice(bugIdx, 1);
    await _saveBugToFile();
  } catch (err) {
    loggerService.error(err);
    throw err;
  }
}
async function save(bugToSave) {
  try {
    if (bugToSave._id) {
      const bugIdx = bugs.findIndex((bug) => bug._id === bugToSave._id);
      if (bugIdx < 0) throw new Error("Cannot find bug");
      bugs[bugIdx] = bugToSave;
    } else {
      bugToSave._id = makeId();
      bugs.push(bugToSave);
    }
    await _saveBugToFile();
  } catch (err) {
    loggerService.error(err);
    throw err;
  }
}
async function createPDF(res) {
  let table = { headers: [], rows: [] };
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
    const b3 = bugs.slice(0,3);
    const b3Id = b3.map(b => b._id);
    console.log("🚀 ~ getThreeIds ~  b3Id:",  JSON.stringify(b3Id))
    
    return b3Id;
}

function _saveBugToFile() {
  writeJsonFile("./data/bugs.json", bugs);
}

// function _filterBugs(filterBy,bugs){
//     if (filterBy.txt)
// }
