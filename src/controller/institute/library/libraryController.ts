import { Response } from "express";
import sequelize from "../../../database/connection";
import { IExtendedRequest } from "../../../middleware/type";
import { QueryTypes } from "sequelize";
import { buildTableName } from "../../../services/sqlSecurityService";

/**
 * Library Controller
 * SECURITY: All table names built using buildTableName() for SQL injection prevention
 */

// Create a new book
const createBook = async (req: IExtendedRequest, res: Response) => {
    const instituteNumber = req.user?.currentInstituteNumber;
    const libraryTable = buildTableName('library_', instituteNumber);
    const { title, author, isbn, category, description, totalCopies, publishedYear, coverImage } = req.body;

    if (!title || !author || !isbn) {
        return res.status(400).json({ message: "Title, Author, and ISBN are required" });
    }

    try {
        await sequelize.query(
            `INSERT INTO \`${libraryTable}\`
            (title, author, isbn, category, description, totalCopies, availableCopies, publishedYear, coverImage, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            {
                replacements: [
                    title, author, isbn,
                    category || 'General',
                    description || null,
                    totalCopies || 1,
                    totalCopies || 1,
                    publishedYear || new Date().getFullYear(),
                    coverImage || null,
                    'available'
                ],
                type: QueryTypes.INSERT
            }
        );

        res.status(201).json({ message: "Book added successfully" });
    } catch (err: any) {
        console.error("Error adding book:", err);
        res.status(500).json({ message: "Error adding book", error: err.message });
    }
};

// Get all books with optional filtering
const getBooks = async (req: IExtendedRequest, res: Response) => {
    const instituteNumber = req.user?.currentInstituteNumber;
    const libraryTable = buildTableName('library_', instituteNumber);
    const { search, category, status } = req.query;

    try {
        let query = `SELECT * FROM \`${libraryTable}\` WHERE 1=1`;
        const replacements: any[] = [];

        if (search) {
            query += ` AND (title LIKE ? OR author LIKE ? OR isbn LIKE ?)`;
            replacements.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (category && category !== 'All Categories') {
            query += ` AND category = ?`;
            replacements.push(category);
        }

        if (status) {
            query += ` AND status = ?`;
            replacements.push(status);
        }

        query += ` ORDER BY createdAt DESC`;

        const books = await sequelize.query(query, {
            replacements,
            type: QueryTypes.SELECT
        });

        res.status(200).json({ message: "Books fetched", data: books });
    } catch (err: any) {
        res.status(500).json({ message: "Error fetching books", error: err.message });
    }
};

// Get single book by ID
const getBookById = async (req: IExtendedRequest, res: Response) => {
    const instituteNumber = req.user?.currentInstituteNumber;
    const libraryTable = buildTableName('library_', instituteNumber);
    const { id } = req.params;

    try {
        const books: any = await sequelize.query(
            `SELECT * FROM \`${libraryTable}\` WHERE id = ?`,
            { replacements: [id], type: QueryTypes.SELECT }
        );

        if (books.length === 0) {
            return res.status(404).json({ message: "Book not found" });
        }

        res.status(200).json({ message: "Book fetched", data: books[0] });
    } catch (err: any) {
        res.status(500).json({ message: "Error fetching book", error: err.message });
    }
};

// Update a book
const updateBook = async (req: IExtendedRequest, res: Response) => {
    const instituteNumber = req.user?.currentInstituteNumber;
    const libraryTable = buildTableName('library_', instituteNumber);
    const { id } = req.params;
    const { title, author, isbn, category, description, totalCopies, publishedYear, coverImage } = req.body;

    try {
        const currentBook: any = await sequelize.query(
            `SELECT * FROM \`${libraryTable}\` WHERE id = ?`,
            { replacements: [id], type: QueryTypes.SELECT }
        );

        if (currentBook.length === 0) {
            return res.status(404).json({ message: "Book not found" });
        }

        const borrowed = currentBook[0].totalCopies - currentBook[0].availableCopies;
        const newAvailable = Math.max(0, (totalCopies || currentBook[0].totalCopies) - borrowed);
        const newStatus = newAvailable === 0 ? 'out-of-stock' : newAvailable <= 3 ? 'low-stock' : 'available';

        await sequelize.query(
            `UPDATE \`${libraryTable}\` SET
            title = ?, author = ?, isbn = ?, category = ?, description = ?,
            totalCopies = ?, availableCopies = ?, publishedYear = ?, coverImage = ?, status = ?
            WHERE id = ?`,
            {
                replacements: [
                    title || currentBook[0].title,
                    author || currentBook[0].author,
                    isbn || currentBook[0].isbn,
                    category || currentBook[0].category,
                    description !== undefined ? description : currentBook[0].description,
                    totalCopies || currentBook[0].totalCopies,
                    newAvailable,
                    publishedYear || currentBook[0].publishedYear,
                    coverImage !== undefined ? coverImage : currentBook[0].coverImage,
                    newStatus,
                    id
                ],
                type: QueryTypes.UPDATE
            }
        );

        res.status(200).json({ message: "Book updated successfully" });
    } catch (err: any) {
        res.status(500).json({ message: "Error updating book", error: err.message });
    }
};

// Delete a book
const deleteBook = async (req: IExtendedRequest, res: Response) => {
    const instituteNumber = req.user?.currentInstituteNumber;
    const libraryTable = buildTableName('library_', instituteNumber);
    const { id } = req.params;

    try {
        await sequelize.query(
            `DELETE FROM \`${libraryTable}\` WHERE id = ?`,
            { replacements: [id], type: QueryTypes.DELETE }
        );

        res.status(200).json({ message: "Book deleted successfully" });
    } catch (err: any) {
        res.status(500).json({ message: "Error deleting book", error: err.message });
    }
};

// Borrow a book
const borrowBook = async (req: IExtendedRequest, res: Response) => {
    const instituteNumber = req.user?.currentInstituteNumber;
    const libraryTable = buildTableName('library_', instituteNumber);
    const borrowTable = buildTableName('library_borrow_', instituteNumber);
    const { bookId, studentId, dueDate } = req.body;

    if (!bookId || !studentId) {
        return res.status(400).json({ message: "Book ID and Student ID are required" });
    }

    const t = await sequelize.transaction();

    try {
        const book: any = await sequelize.query(
            `SELECT * FROM \`${libraryTable}\` WHERE id = ?`,
            { replacements: [bookId], type: QueryTypes.SELECT, transaction: t }
        );

        if (book.length === 0) {
            await t.rollback();
            return res.status(404).json({ message: "Book not found" });
        }

        if (book[0].availableCopies <= 0) {
            await t.rollback();
            return res.status(400).json({ message: "No copies available for borrowing" });
        }

        await sequelize.query(
            `INSERT INTO \`${borrowTable}\` (bookId, studentId, borrowDate, dueDate, status)
            VALUES (?, ?, NOW(), ?, 'borrowed')`,
            { replacements: [bookId, studentId, dueDate || null], type: QueryTypes.INSERT, transaction: t }
        );

        const newAvailable = book[0].availableCopies - 1;
        const newStatus = newAvailable === 0 ? 'out-of-stock' : newAvailable <= 3 ? 'low-stock' : 'available';

        await sequelize.query(
            `UPDATE \`${libraryTable}\` SET availableCopies = ?, status = ? WHERE id = ?`,
            { replacements: [newAvailable, newStatus, bookId], type: QueryTypes.UPDATE, transaction: t }
        );

        await t.commit();
        res.status(200).json({ message: "Book borrowed successfully" });
    } catch (err: any) {
        await t.rollback();
        res.status(500).json({ message: "Error borrowing book", error: err.message });
    }
};

// Return a book
const returnBook = async (req: IExtendedRequest, res: Response) => {
    const instituteNumber = req.user?.currentInstituteNumber;
    const libraryTable = buildTableName('library_', instituteNumber);
    const borrowTable = buildTableName('library_borrow_', instituteNumber);
    const { borrowId } = req.body;

    if (!borrowId) {
        return res.status(400).json({ message: "Borrow ID is required" });
    }

    const t = await sequelize.transaction();

    try {
        const borrowRecord: any = await sequelize.query(
            `SELECT * FROM \`${borrowTable}\` WHERE id = ? AND status = 'borrowed'`,
            { replacements: [borrowId], type: QueryTypes.SELECT, transaction: t }
        );

        if (borrowRecord.length === 0) {
            await t.rollback();
            return res.status(404).json({ message: "Borrow record not found or already returned" });
        }

        const bookId = borrowRecord[0].bookId;

        await sequelize.query(
            `UPDATE \`${borrowTable}\` SET status = 'returned', returnDate = NOW() WHERE id = ?`,
            { replacements: [borrowId], type: QueryTypes.UPDATE, transaction: t }
        );

        await sequelize.query(
            `UPDATE \`${libraryTable}\` SET
            availableCopies = availableCopies + 1,
            status = CASE
                WHEN availableCopies + 1 > 3 THEN 'available'
                WHEN availableCopies + 1 > 0 THEN 'low-stock'
                ELSE 'out-of-stock'
            END
            WHERE id = ?`,
            { replacements: [bookId], type: QueryTypes.UPDATE, transaction: t }
        );

        await t.commit();
        res.status(200).json({ message: "Book returned successfully" });
    } catch (err: any) {
        await t.rollback();
        res.status(500).json({ message: "Error returning book", error: err.message });
    }
};

// Get borrowing history for a student
const getStudentBorrowHistory = async (req: IExtendedRequest, res: Response) => {
    const instituteNumber = req.user?.currentInstituteNumber;
    const libraryTable = buildTableName('library_', instituteNumber);
    const borrowTable = buildTableName('library_borrow_', instituteNumber);
    const { studentId } = req.params;

    try {
        const history = await sequelize.query(
            `SELECT b.*, l.title, l.author, l.isbn
             FROM \`${borrowTable}\` b
             JOIN \`${libraryTable}\` l ON b.bookId = l.id
             WHERE b.studentId = ?
             ORDER BY b.borrowDate DESC`,
            { replacements: [studentId], type: QueryTypes.SELECT }
        );

        res.status(200).json({ message: "Borrow history fetched", data: history });
    } catch (err: any) {
        res.status(500).json({ message: "Error fetching borrow history", error: err.message });
    }
};

export {
    createBook,
    getBooks,
    getBookById,
    updateBook,
    deleteBook,
    borrowBook,
    returnBook,
    getStudentBorrowHistory
};
