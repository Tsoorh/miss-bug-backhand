import configProd from "./prod.js"
import configDev from "./dev.js"

import dotenv from 'dotenv';
dotenv.config();

export var config

console.log("🚀 ~ process.env.NODE_ENV:", process.env.NODE_ENV)
if (process.env.NODE_ENV === "production") {
    config = configProd
} else {
    config = configDev
}

