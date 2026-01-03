import { NextFunction, Request, Response } from "express";

import { PrismaClient } from "../../database/prisma";
import { IExtendedRequest } from "../../middleware/type";
const prisma = new PrismaClient();

// CREATE INSTITUTE (Prisma, static table)
const createInstitute = async (req: IExtendedRequest, res: Response) => {
  const {
    instituteName,
    instituteEmail,
    institutePhoneNumber,
    instituteAddress,
  } = req.body;
  const instituteVatNo = req.body.instituteVatNo || null;
  const institutePanNo = req.body.institutePanNo || null;
  if (
    !instituteName ||
    !instituteEmail ||
    !institutePhoneNumber ||
    !instituteAddress
  ) {
    return res.status(400).json({
      message:
        "Please provide instituteName, instituteEmail, institutePhoneNumber, instituteAddress",
    });
  }
  try {
    const newInstitute = await prisma.institute.create({
      data: {
        instituteName,
        email: instituteEmail,
        phone: institutePhoneNumber,
        address: instituteAddress,
        panNo: institutePanNo,
        vatNo: instituteVatNo,
        owner: req.user ? { connect: { id: req.user.id } } : undefined,
      },
    });
    if (req.user) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: {
          currentInstituteNumber: newInstitute.instituteNumber,
          role: "institute",
        },
      });
      req.user.currentInstituteNumber = newInstitute.instituteNumber;
    }
    res.status(201).json({
      message: "Institute created successfully!",
      institute: newInstitute,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error creating institute", error: error.message });
  }
};

// mysql doesn't support array like mongodb

// All dynamic table creation functions are obsolete with Prisma. All data is stored in static tables with instituteId columns.
// TODO: Migrate all business logic to use Prisma static models and remove all sequelize.query usage.

// const createTeacherTable = async (req:IExtendedRequest,res:Response,next:NextFunction)=>{
//               const instituteNumber = req.user?.currentInstituteNumber
//               await sequelize.query(`CREATE TABLE IF NOT EXISTS teacher_${instituteNumber}(
//                id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
//               firstName VARCHAR(255) NOT NULL,
//               lastName VARCHAR(255) NOT NULL,
//               teacherEmail VARCHAR(255) NOT NULL UNIQUE,
//               teacherPhoneNumber VARCHAR(255) NOT NULL UNIQUE,
//               teacherExperience VARCHAR(255),
//               joinedDate DATE,
//               salary VARCHAR(100),
//               teacherPhoto VARCHAR(255),
//               teacherPassword VARCHAR(255),
//               courseId VARCHAR(100) REFERENCES course_${instituteNumber}(id),
//               createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//               updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
//               )`)
//               next()
// }

// Other dynamic table creation functions are similarly marked as obsolete.

// ...existing code...

// teacher-chapter
const createCourseChapterTable = async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  const instituteNumber = req.user?.currentInstituteNumber;
  await sequelize.query(`CREATE TABLE IF NOT EXISTS course_chapter_${instituteNumber}(
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        chapterName VARCHAR(255) NOT NULL,
        chapterDuration VARCHAR(100) NOT NULL,
        chapterLevel ENUM('beginner','intermediate','advance') NOT NULL,
        courseId VARCHAR(36) REFERENCES course_${instituteNumber}(id) ON DELETE CASCADE ON UPDATE CASCADE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`);
  next();
};

const createStudentTable = async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const instituteNumber = req.user?.currentInstituteNumber;
    await sequelize.query(`CREATE TABLE IF NOT EXISTS student_${instituteNumber}(
             id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
            firstName VARCHAR(255) NOT NULL,
            lastName VARCHAR(255) NOT NULL,
            studentPhoneNo VARCHAR(255) NOT NULL UNIQUE,
            studentAddress TEXT,
            enrolledDate DATE,
            studentImage VARCHAR(255),
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )`);
    next();
  } catch (error) {
    console.log(error, "Error");
    res.status(500).json({
      message: error,
    });
  }
};

const createCourseTable = async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  const instituteNumber = req.user?.currentInstituteNumber;
  await sequelize.query(`CREATE TABLE IF NOT EXISTS course_${instituteNumber}(
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        courseName VARCHAR(255) NOT NULL UNIQUE,
        coursePrice VARCHAR(255) NOT NULL,
        courseDuration VARCHAR(100) NOT NULL,
        courseLevel ENUM('beginner','intermediate','advance') NOT NULL,
        courseThumbnail VARCHAR(200),
        courseDescription TEXT,
        teacherId VARCHAR(36) REFERENCES teacher_${instituteNumber}(id),
        categoryId VARCHAR(36) NOT NULL REFERENCES category_${instituteNumber} (id),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`);

  // res.status(200).json({
  //     message : "Institute created vayoo!!!",
  //     instituteNumber,
  // })
  next();
};

const createCategoryTable = async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  const instituteNumber = req.user?.currentInstituteNumber;
  await sequelize.query(`CREATE TABLE IF NOT EXISTS category_${instituteNumber}(
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        categoryName VARCHAR(100) NOT NULL,
        categoryDescription TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`);

  categories.forEach(async function (category) {
    await sequelize.query(
      `INSERT INTO category_${instituteNumber}(categoryName,categoryDescription) VALUES(?,?)`,
      {
        replacements: [category.categoryName, category.categoryDescription],
      }
    );
  });
  next();
};
// Chapter lessons table for course content
const createChapterLessonTable = async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  const instituteNumber = req.user?.currentInstituteNumber;
  await sequelize.query(`CREATE TABLE IF NOT EXISTS chapter_lesson_${instituteNumber}(
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    lessonName VARCHAR(255) NOT NULL,
    lessonDescription TEXT,
    lessonDuration VARCHAR(100),
    lessonVideo VARCHAR(500),
    lessonOrder INT DEFAULT 0,
    chapterId VARCHAR(36) REFERENCES course_chapter_${instituteNumber}(id) ON DELETE CASCADE ON UPDATE CASCADE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`);
  next();
};

const createAttendanceTable = async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  const instituteNumber = req.user?.currentInstituteNumber;
  await sequelize.query(`CREATE TABLE IF NOT EXISTS attendance_${instituteNumber}(
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    studentId VARCHAR(36) REFERENCES student_${instituteNumber}(id) ON DELETE CASCADE,
    courseId VARCHAR(36) REFERENCES course_${instituteNumber}(id) ON DELETE CASCADE,
    attendanceDate DATE NOT NULL,
    status ENUM('present', 'absent', 'late', 'excused') DEFAULT 'present',
    remarks TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`);
  next();
};

const createAssessmentTable = async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  const instituteNumber = req.user?.currentInstituteNumber;
  await sequelize.query(`CREATE TABLE IF NOT EXISTS assessment_${instituteNumber}(
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    courseId VARCHAR(36) REFERENCES course_${instituteNumber}(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    assessmentType ENUM('quiz', 'exam', 'assignment', 'project') DEFAULT 'exam',
    maxMarks INT NOT NULL,
    assessmentDate DATE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`);
  next();
};

const createResultTable = async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  const instituteNumber = req.user?.currentInstituteNumber;
  await sequelize.query(`CREATE TABLE IF NOT EXISTS result_${instituteNumber}(
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    studentId VARCHAR(36) REFERENCES student_${instituteNumber}(id) ON DELETE CASCADE,
    assessmentId VARCHAR(36) REFERENCES assessment_${instituteNumber}(id) ON DELETE CASCADE,
    marksObtained DECIMAL(5,2) NOT NULL,
    status ENUM('passed', 'failed', 'graded') DEFAULT 'graded',
    remarks TEXT,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`);
  next();
};

const createFeeTables = async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  const instituteNumber = req.user?.currentInstituteNumber;

  // Fee Structure
  await sequelize.query(`CREATE TABLE IF NOT EXISTS fee_structure_${instituteNumber}(
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    frequency ENUM('monthly', 'quarterly', 'yearly', 'once') DEFAULT 'monthly',
    description TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  // Fee Payments
  await sequelize.query(`CREATE TABLE IF NOT EXISTS fee_payment_${instituteNumber}(
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    studentId VARCHAR(36) REFERENCES student_${instituteNumber}(id) ON DELETE CASCADE,
    feeStructureId VARCHAR(36) REFERENCES fee_structure_${instituteNumber}(id),
    amountPaid DECIMAL(10,2) NOT NULL,
    balance DECIMAL(10,2) NOT NULL,
    paymentDate DATE NOT NULL,
    paymentMethod ENUM('cash', 'bank_transfer', 'online', 'cheque') DEFAULT 'cash',
    status ENUM('paid', 'partial', 'pending') DEFAULT 'paid',
    receiptNumber VARCHAR(50),
    remarks TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  next();
};

const createExamScheduleTable = async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  const instituteNumber = req.user?.currentInstituteNumber;
  await sequelize.query(`CREATE TABLE IF NOT EXISTS exam_schedule_${instituteNumber}(
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    assessmentId VARCHAR(36) REFERENCES assessment_${instituteNumber}(id) ON DELETE CASCADE,
    examDate DATE NOT NULL,
    startTime TIME NOT NULL,
    endTime TIME NOT NULL,
    roomId VARCHAR(50),
    invigilatorId VARCHAR(36) REFERENCES teacher_${instituteNumber}(id),
    instructions TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  next();
};

const createSecurityLogsTable = async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  const instituteNumber = req.user?.currentInstituteNumber;
  await sequelize.query(`CREATE TABLE IF NOT EXISTS security_logs_${instituteNumber}(
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    userId VARCHAR(36),
    action VARCHAR(255) NOT NULL,
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  next();
};

const createLibraryTables = async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  const instituteNumber = req.user?.currentInstituteNumber;

  // Books table
  await sequelize.query(`CREATE TABLE IF NOT EXISTS library_${instituteNumber}(
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(50) NOT NULL,
    category VARCHAR(100) DEFAULT 'General',
    description TEXT,
    coverImage VARCHAR(500),
    totalCopies INT DEFAULT 1,
    availableCopies INT DEFAULT 1,
    publishedYear INT,
    status ENUM('available', 'low-stock', 'out-of-stock') DEFAULT 'available',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`);

  // Borrowing records table
  await sequelize.query(`CREATE TABLE IF NOT EXISTS library_borrow_${instituteNumber}(
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    bookId VARCHAR(36) REFERENCES library_${instituteNumber}(id) ON DELETE CASCADE,
    studentId VARCHAR(36) REFERENCES student_${instituteNumber}(id) ON DELETE CASCADE,
    borrowDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dueDate DATE,
    returnDate TIMESTAMP,
    status ENUM('borrowed', 'returned', 'overdue') DEFAULT 'borrowed',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  res.status(200).json({
    message: "Institute and all tables created successfully!",
    instituteNumber,
  });
};

export {
  createInstitute,
  createTeacherTable,
  createStudentTable,
  createCourseTable,
  createCategoryTable,
  createCourseChapterTable,
  createChapterLessonTable,
  createAttendanceTable,
  createAssessmentTable,
  createResultTable,
  createSecurityLogsTable,
  createFeeTables,
  createExamScheduleTable,
  createLibraryTables,
};
