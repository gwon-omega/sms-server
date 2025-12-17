import { Response } from "express";
import { IExtendedRequest } from "../../../middleware/type";
import sequelize from "../../../database/connection";
import { QueryTypes } from "sequelize";
import generateRandomPassword from "../../../services/generateRandomPassword";
import sendMail from "../../../services/sendMail";


const createTeacher = async(req:IExtendedRequest,res:Response)=>{
    // teacher ko k k data chayenxa tyo accept garam
    const instituteNumber = req.user?.currentInstituteNumber ;
    const {teacherName,teacherEmail,teacherPhoneNumber,teacherExperience,teacherSalary,teacherJoinedDate,courseId} = req.body
    const teacherPhoto = req.file ? req.file.path : "https://static.vecteezy.com/system/resources/thumbnails/001/840/618/small/picture-profile-icon-male-icon-human-or-people-sign-and-symbol-free-vector.jpg"
    if(!teacherName || !teacherEmail || !teacherPhoneNumber || !teacherExperience || !teacherSalary || !teacherJoinedDate || !courseId){
        return res.status(400).json({
            message : "Please provide teacherName,teacherEmail,teacherPhoneNumber,teacherExperience,teacherSalary,teacherJoinedDate,courseId"
        })
    }
    // password generate functionnn
    const data = generateRandomPassword(teacherName)
    const insertedData =  await sequelize.query(`INSERT INTO teacher_${instituteNumber}(teacherName,teacherEmail,teacherPhoneNumber,teacherExperience,joinedDate,salary,teacherPhoto,teacherPassword, courseId) VALUES(?,?,?,?,?,?,?,?,?)`,{
        type : QueryTypes.INSERT,
        replacements : [teacherName,teacherEmail,teacherPhoneNumber,teacherExperience,teacherJoinedDate,teacherSalary,teacherPhoto,data.hashedVersion, courseId]
    })

    const teacherData : {id:string}[]= await sequelize.query(`SELECT id FROM teacher_${instituteNumber} WHERE teacherEmail=?`,{
        type : QueryTypes.SELECT,
        replacements : [teacherEmail]
    })

    // await sequelize.query(`UPDATE course_${instituteNumber} SET teacherId=? WHERE id=?`,{
    //     type : QueryTypes.UPDATE,
    //     replacements : [teacherData[0].id,courseId]
    // })

    // send mail function goes here
    const mailInformation = {
        to : teacherEmail,
        subject : "Welcome to our saas MERN project",
        text : `You've registered successfully.<br /> <b>Email</b> : ${teacherEmail}, Password : ${data.plainVersion}, Your Institute Number : ${instituteNumber}`
    }
    await sendMail(mailInformation)

    res.status(200).json({
        message : "teacher created"
    })

}

const getTeachers = async(req:IExtendedRequest,res:Response)=>{
    const instituteNumber = req.user?.currentInstituteNumber;
    const teachers = await sequelize.query(`SELECT t.*,c.courseName FROM teacher_${instituteNumber} AS t JOIN course_${instituteNumber} AS c ON t.courseId = c.id`,{
        type : QueryTypes.SELECT
    })
    res.status(200).json({
        message : "teachers fetched", data:teachers
    })
}

const deleteTeacher = async(req:IExtendedRequest,res:Response)=>{
    const instituteNumber = req.user?.currentInstituteNumber;
    const id = req.params.id
    await sequelize.query(`DELETE FROM teacher_${instituteNumber} WHERE id=?`,{
        type : QueryTypes.DELETE,
        replacements : [id]
    })
    res.status(200).json({
        message : "delete Teacher successfully"
    })
}


export {createTeacher,getTeachers,deleteTeacher}
