import {Sequelize} from 'sequelize-typescript'
import { config } from "dotenv";
config()

const sequelize = new Sequelize({
    database : process.env.DB_NAME , // database ko name
    username : process.env.DB_USERNAME, // database ko username, by default root
    password :process.env.DB_PASSWORD,  // database ko password, by default ""
    host : process.env.DB_HOST, // database ko location, kaha xa vanne kura, localhost(mycomputer)
    dialect : "mysql", // k database use garna aateko vanne kura,
    port : Number(process.env.DB_PORT),
    models : [__dirname + '/models'], // current location + '/models'
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
})

// Only authenticate and sync here, not in server.ts
sequelize.authenticate()
.then(()=>{
    console.log("Database authenticated, connected")
})
.catch((error)=>{
    console.error("Database authentication failed:", error.message)
})

// Sync database - use alter:false to avoid index issues in production
// For schema changes, use explicit migrations instead
const syncOptions = process.env.NODE_ENV === 'development'
  ? { alter: false } // Don't auto-alter in dev to avoid too many keys error
  : { force: false };

sequelize.sync(syncOptions)
.then(()=>{
    console.log("Database synced successfully")
})
.catch((error) => {
    console.error("Database sync failed:", error.message)
    // Don't exit process, server can still run with existing schema
})


export default sequelize;

