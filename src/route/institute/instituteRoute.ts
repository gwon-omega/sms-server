



import express, { Router } from "express"


import { createCategoryTable, createChapterLessonTable, createCourseChapterTable, createCourseTable, createInstitute, createStudentTable, createTeacherTable } from "../../controller/institute/instituteController"
import asyncErrorHandler from "../../services/asyncErrorHandler"
import { isLoggedIn, restrictTo } from "../../middleware/middleware"
import { UserRole } from "../../middleware/type"


const router:Router = express.Router()

router.route("/").post(isLoggedIn, 
    createInstitute,
    createTeacherTable,
    createStudentTable, 
    createCategoryTable, 
    createCourseChapterTable,
    createChapterLessonTable,
    asyncErrorHandler(createCourseTable))


export default router

 