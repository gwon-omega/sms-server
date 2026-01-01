import { Response } from "express";
import sequelize from "../../../database/connection";
import { IExtendedRequest } from "../../../middleware/type";
import { QueryTypes } from "sequelize";
import { buildTableName } from "../../../services/sqlSecurityService";

/**
 * Student Controller
 * SECURITY: All table names are built using buildTableName() to prevent SQL injection
 */

const getStudents = async (req: IExtendedRequest, res: Response) => {
    const instituteNumber = req.user?.currentInstituteNumber;
    const tableName = buildTableName('student_', instituteNumber);

    const students = await sequelize.query(`SELECT * FROM \`${tableName}\``, {
        type: QueryTypes.SELECT
    });

    res.status(200).json({
        message: "students fetched",
        data: students
    });
};

// Create a new student
const createStudent = async (req: IExtendedRequest, res: Response) => {
    const instituteNumber = req.user?.currentInstituteNumber;
    const tableName = buildTableName('student_', instituteNumber);

    const { firstName, lastName, studentPhoneNo, studentAddress, enrolledDate, studentImage } = req.body;
    const studentImg = req.file ? req.file.path : (studentImage || "https://static.vecteezy.com/system/resources/thumbnails/001/840/618/small/picture-profile-icon-male-icon-human-or-people-sign-and-symbol-free-vector.jpg");

    if (!firstName || !lastName || !studentPhoneNo || !studentAddress || !enrolledDate) {
        return res.status(400).json({
            message: "Enter firstName, lastName, studentPhoneNo, studentAddress, enrolledDate, studentImage"
        });
    }

    try {
        await sequelize.query(
            `INSERT INTO \`${tableName}\` (firstName, lastName, studentPhoneNo, studentAddress, enrolledDate, studentImage) VALUES (?, ?, ?, ?, ?, ?)`,
            {
                replacements: [firstName, lastName, studentPhoneNo, studentAddress, enrolledDate, studentImg],
                type: QueryTypes.INSERT
            }
        );

        // Fetch the newly created student to return in response
        const students: any = await sequelize.query(
            `SELECT * FROM \`${tableName}\` WHERE studentPhoneNo = ? ORDER BY createdAt DESC LIMIT 1`,
            {
                replacements: [studentPhoneNo],
                type: QueryTypes.SELECT
            }
        );

        res.status(201).json({ message: "Student created", data: students[0] });
    } catch (err: any) {
        console.error('Error inserting student:', err);
        res.status(500).json({ message: 'Error creating student', error: err.message });
    }
};

// Get all students
const getAllStudents = async (req: IExtendedRequest, res: Response) => {
    const instituteNumber = req.user?.currentInstituteNumber;
    const tableName = buildTableName('student_', instituteNumber);

    const students = await sequelize.query(
        `SELECT * FROM \`${tableName}\``,
        { type: QueryTypes.SELECT }
    );

    res.status(200).json({ message: "Students fetched", data: students });
};

// Get a single student by ID
const getSingleStudent = async (req: IExtendedRequest, res: Response) => {
    const instituteNumber = req.user?.currentInstituteNumber;
    const tableName = buildTableName('student_', instituteNumber);
    const { id } = req.params;

    const students: any = await sequelize.query(
        `SELECT * FROM \`${tableName}\` WHERE id = ?`,
        { replacements: [id], type: QueryTypes.SELECT }
    );

    if (!students || students.length === 0) {
        return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({ message: "Student fetched", data: students[0] });
};

// Delete a student by ID
const deleteStudent = async (req: IExtendedRequest, res: Response) => {
    const instituteNumber = req.user?.currentInstituteNumber;
    const tableName = buildTableName('student_', instituteNumber);
    const { id } = req.params;

    await sequelize.query(
        `DELETE FROM \`${tableName}\` WHERE id = ?`,
        { replacements: [id], type: QueryTypes.DELETE }
    );

    res.status(200).json({ message: "Student deleted" });
};

export { getStudents, createStudent, getAllStudents, getSingleStudent, deleteStudent };
