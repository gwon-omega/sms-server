import { Response } from "express";
import { IExtendedRequest } from "../../../middleware/type";
import sequelize from "../../../database/connection";
import { QueryTypes } from "sequelize";
import generateRandomPassword from "../../../services/generateRandomPassword";
import sendMail from "../../../services/sendMail";
import { buildTableName } from "../../../services/sqlSecurityService";

/**
 * Teacher Controller (Institute-level)
 * SECURITY: All table names are built using buildTableName() to prevent SQL injection
 */

const createTeacher = async (req: IExtendedRequest, res: Response) => {
    const instituteNumber = req.user?.currentInstituteNumber;
    const teacherTable = buildTableName('teacher_', instituteNumber);
    const courseTable = buildTableName('course_', instituteNumber);

    const { firstName, lastName, teacherEmail, teacherPhoneNumber, teacherExperience, teacherSalary, teacherJoinedDate, courseId } = req.body;
    const teacherPhoto = req.file ? req.file.path : "https://static.vecteezy.com/system/resources/thumbnails/001/840/618/small/picture-profile-icon-male-icon-human-or-people-sign-and-symbol-free-vector.jpg";

    if (!firstName || !lastName || !teacherEmail || !teacherPhoneNumber || !teacherExperience || !teacherSalary || !teacherJoinedDate || !courseId) {
        return res.status(400).json({
            message: "Please provide firstName, lastName, teacherEmail, teacherPhoneNumber, teacherExperience, teacherSalary, teacherJoinedDate, courseId"
        });
    }

    // Generate password
    const data = generateRandomPassword(`${firstName} ${lastName}`);

    await sequelize.query(
        `INSERT INTO \`${teacherTable}\` (firstName, lastName, teacherEmail, teacherPhoneNumber, teacherExperience, joinedDate, salary, teacherPhoto, teacherPassword, courseId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        {
            type: QueryTypes.INSERT,
            replacements: [firstName, lastName, teacherEmail, teacherPhoneNumber, teacherExperience, teacherJoinedDate, teacherSalary, teacherPhoto, data.hashedVersion, courseId]
        }
    );

    const teacherData: { id: string }[] = await sequelize.query(
        `SELECT id FROM \`${teacherTable}\` WHERE teacherEmail = ?`,
        {
            type: QueryTypes.SELECT,
            replacements: [teacherEmail]
        }
    );

    // Send welcome email
    const mailInformation = {
        to: teacherEmail,
        subject: "Welcome to EduFlow",
        text: `You've registered successfully.\n\nEmail: ${teacherEmail}\nPassword: ${data.plainVersion}\nInstitute Number: ${instituteNumber}`,
        html: `
            <div style="font-family: Arial, sans-serif;">
                <h2>Welcome to EduFlow!</h2>
                <p>You've been registered as a teacher.</p>
                <p><strong>Email:</strong> ${teacherEmail}</p>
                <p><strong>Password:</strong> ${data.plainVersion}</p>
                <p><strong>Institute Number:</strong> ${instituteNumber}</p>
                <p style="color: #666;">Please change your password after first login.</p>
            </div>
        `
    };
    await sendMail(mailInformation);

    res.status(200).json({
        message: "Teacher created successfully"
    });
};

const getTeachers = async (req: IExtendedRequest, res: Response) => {
    const instituteNumber = req.user?.currentInstituteNumber;
    const teacherTable = buildTableName('teacher_', instituteNumber);
    const courseTable = buildTableName('course_', instituteNumber);

    const teachers = await sequelize.query(
        `SELECT t.*, c.courseName FROM \`${teacherTable}\` AS t JOIN \`${courseTable}\` AS c ON t.courseId = c.id`,
        { type: QueryTypes.SELECT }
    );

    res.status(200).json({
        message: "Teachers fetched",
        data: teachers
    });
};

const deleteTeacher = async (req: IExtendedRequest, res: Response) => {
    const instituteNumber = req.user?.currentInstituteNumber;
    const teacherTable = buildTableName('teacher_', instituteNumber);
    const { id } = req.params;

    await sequelize.query(
        `DELETE FROM \`${teacherTable}\` WHERE id = ?`,
        {
            type: QueryTypes.DELETE,
            replacements: [id]
        }
    );

    res.status(200).json({
        message: "Teacher deleted successfully"
    });
};

export { createTeacher, getTeachers, deleteTeacher };
