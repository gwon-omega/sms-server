/**
 * Legacy MySQL/Sequelize Connection (DISABLED)
 *
 * ⚠️ THIS PROJECT NOW USES PRISMA + SUPABASE POSTGRESQL ONLY
 *
 * This file is kept for backward compatibility with existing controllers
 * that import sequelize, but MySQL connection is completely disabled.
 *
 * All database operations should use Prisma Client from '../database/prisma'
 *
 * To migrate old Sequelize code to Prisma:
 * 1. Replace: import sequelize from './database/connection'
 *    With:    import prisma from './database/prisma'
 * 2. Replace raw SQL queries with Prisma queries
 * 3. See: https://www.prisma.io/docs/guides/migrate-to-prisma/migrate-from-sequelize
 */

import { Sequelize } from "sequelize-typescript";
import { config } from "dotenv";
config();

console.log(
  "ℹ️  MySQL/Sequelize DISABLED - Using Prisma + Supabase PostgreSQL only"
);
console.log("ℹ️  Legacy sequelize import available for backward compatibility");

// Create a dummy Sequelize instance that won't actually connect
// This prevents crashes in old code that still imports sequelize
const sequelize = new Sequelize({
  database: "disabled_mysql",
  username: "root",
  password: "",
  host: "localhost",
  dialect: "mysql",
  port: 3306,
  models: [__dirname + "/models"],
  logging: false, // Disable all logging
  // Prevent automatic connection attempts
  pool: {
    max: 0,
    min: 0,
    acquire: 0,
    idle: 0,
  },
});

// No authentication or sync - MySQL is completely disabled

export default sequelize;
