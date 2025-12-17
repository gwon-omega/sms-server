import express from 'express'
const app = express()
import authRoute from "./route/globals/auth/authRoute"
import instituteRoute from "./route/institute/instituteRoute"
import courseRoute from './route/institute/course/courseRoute'
import studentRoute from './route/institute/student/studentRoute'
import categoryRoute from './route/institute/category/categoryRoute'
import teacherInstituteRoute from './route/institute/teacher/teacherRoute'
import teacherRoute from './route/teacher/teacherRoute'
import lessonRoute from './route/teacher/course/lessons/course-lesson'
import chapterRoute from './route/teacher/course/chapters/course-chapter-router'
import studentInstituteRoute from './route/student/institute/student-institute.route'
import studentCartRoute from './route/student/cart/student-cart.route'
import studentCourseOrderRoute from './route/student/order/student-order.route'

import cors from 'cors'

app.use(express.json())
// alternative body-parser

// cors config 
app.use(cors({
    origin : ["http://localhost:3003","http://localhost:3001","http://localhost:3002","http://localhost:3000"]
}))
//GLOBAL ROUTE
app.use("/api/auth",authRoute)

//INSTITUTE ROUTE
app.use("/api/institute",instituteRoute)
app.use('/api/institute/course',courseRoute)
app.use('/api/institute/student',studentRoute)
app.use('/api/institute/category',categoryRoute)
app.use('/api/institute/teacher',teacherInstituteRoute)

//TEACHER ROUTE
app.use("/api/teacher",teacherRoute)
app.use("/api/teacher/course",chapterRoute)
app.use("/api/teacher/course",lessonRoute)

// student route 
app.use("/api/student",studentInstituteRoute)
app.use('/api/student/',studentCartRoute)
app.use("/api/student",studentCourseOrderRoute)

export default app