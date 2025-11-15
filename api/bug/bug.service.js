import { loggerService } from "../../services/logger.service.js";
import {
  makeId,
  readJsonFile,
  writeJsonFile,
  writePDF,
} from "../../services/utils.js";

const bugs = readJsonFile("./data/bugs.json");
const PAGE_SIZE = 4;

export const bugService = {
  query,
  getById,
  remove,
  save,
  createPDF,
  getThreeIds,
};

async function query(filterBy = {}, sort = {}, pageIdx = 0) {
  let bugsToDisplay = bugs;

  const sortProps = ["title", "severity", "createdAt"];
  try {
    if (sort.sortBy && sortProps.includes(sort.sortBy)) {
      const sortParam = sort.sortBy;
      const sortDir = +sort.sortDir || 1;

      bugsToDisplay.sort((bug1, bug2) => {
        const val1 = bug1[sortParam];
        const val2 = bug2[sortParam];

        let compare;

        if (typeof val1 === "string") {
          compare = val1
            .toLowerCase()
            .trim()
            .localeCompare(val2.toLowerCase().trim());
        } else {
          compare = val1 - val2;
        }
        return compare * sortDir;
      });
    }
    if (filterBy) {
      if (filterBy.txt) {
        const regExp = new RegExp(filterBy.txt, "i");
        bugsToDisplay = bugsToDisplay.filter((bug) => regExp.test(bug.title));
      }
      if (filterBy.severity) {
        bugsToDisplay = bugsToDisplay.filter(
          (bug) => bug.severity >= filterBy.severity
        );
      }
      if (filterBy.labels.length > 0) {
        bugsToDisplay = bugsToDisplay.filter((bug) =>
          filterBy.labels.every((label) => bug.labels.includes(label))
        );
      }
    }
    if (pageIdx) {
      const startIdx = pageIdx * PAGE_SIZE;
      bugsToDisplay = bugsToDisplay.slice(startIdx, startIdx + PAGE_SIZE);
    }

    return bugsToDisplay;
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
  const b3 = bugs.slice(0, 3);
  const b3Id = b3.map((b) => b._id);
  console.log("🚀 ~ getThreeIds ~  b3Id:", JSON.stringify(b3Id));

  return b3Id;
}
function _saveBugToFile() {
  writeJsonFile("./data/bugs.json", bugs);
}

function _checkPermission(userId, bugUserId) {
  return userId === bugUserId;
}


