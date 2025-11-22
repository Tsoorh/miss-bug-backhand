import { ObjectId } from "mongodb"
import { dbService } from "../../services/db.service"
import { loggerService } from "../../services/logger.service"

const COLLECTION = 'msg'

export const msgService = {
    query,
    getById,
    remove,
    add,
    update
}


async function query(filterBy = {}) {
    try {
        const collection = await dbService.getCollection(COLLECTION)
        const criteria = _getCrtiteria(filterBy)
        const msgCurser = await collection.find(criteria)

        const msgs = msgCurser.toArray()
        if (!msgs) throw new Error('No messages founds!')


        return msgs
    } catch (err) {
        loggerService.error(err)
        throw err
    }
}
async function getById(msgId) {
    try {
        const collection = await dbService.getCollection(COLLECTION)
        const criteria = { _id: ObjectId.createFromHexStringe(msgId) }

        const msg = await collection.findOne(criteria)
        if (!msg) throw new Error('No msg was found!')

        return msg
    } catch (err) {
        loggerService.error(err)
        throw err
    }
}
async function remove(msgId) {
    try {
        const collection = await dbService.getCollection(COLLECTION)
        const criteria = { _id: ObjectId.createFromHexString(msgId) }
        const res = await collection.deleteOne(criteria)

        if (res.deletedCount === 0) throw new Error('Couldnt remove msg')

        return msgId
    } catch (err) {
        loggerService.error(err)
        throw err
    }
}
async function add(msg) {
    try {
        const collection = await dbService.getCollection(COLLECTION)
        const res = await collection.insertOne(msg)

        if (!res.acknowledged) throw new Error('Couldnt add msg')

        msg._id = res.insertedId
        const agrMsg = _createAggergateMsg(msg)
        return agrMsg
    } catch (err) {
        loggerService.error(err)
        throw err
    }
}
async function update(msg) {
    try {
        const collection = await dbService.getCollection(COLLECTION)
        const criteria = { _id: ObjectId.createFromHexString(msg._id) }

        const { _id, ...msgToSet } = msg;
        const setMsg = { $set: msgToSet }

        const res = await collection.updateOne(criteria, setMsg);
        if (res.modifiedCount === 0) throw new Error('couldnt update msg')

        return msg
    } catch (err) {
        loggerService.error(err)
        throw err
    }
}


function _getCrtiteria(filterBy) {
    const criteria = {}
    if (filterBy.txt) {
        criteria.txt = { $regex: filterBy.txt, $options: 'i' }
    }
    if (filterBy.bugId) {
        criteria.aboutBugId = filterBy.bugId
    }
    if (filterBy.userId) {
        criteria.aboutUserId = filterBy.userId
    }

    return criteria
}

async function _createAggergateMsg(msg) {
    const match = {$match:{ _id: msg._id }}
    const lookupUser = {
        $lookup: {
            'from': 'user',
            'localField': 'byUserId',
            'foreignField': '_id',
            'as': 'ByUser'
        }
    }
    const unwindUser = {
        $unwind: '$ByUser'
    }
    const lookupBug = {
        $lookup: {
            'from': 'bug',
            'localField': 'aboutBugId',
            'foreignField': '_id',
            'as': 'aboutBug'
        }
    }
    const unwindBug =
    {
        $unwind: '$aboutBug'
    }
    const project = {
        $project: {
            _id: 1,
            txt: 1,
            aboutBug: 1,
            ByUser: 1
        }
    }
    const pipeline =[match,lookupUser,unwindUser,lookupBug,unwindBug,project]
    const collection = await dbService.getCollection(COLLECTION)
    const agrMsg = await collection.aggregate(pipeline)
    return agrMsg.toArray()
}