import { Response } from "express";
import { IExtendedRequest } from "../../../middleware/type";
import sequelize from "../../../database/connection";
import { QueryTypes } from "sequelize";
import { CreatedAt } from "sequelize-typescript";



const createCategory = async(req:IExtendedRequest,res:Response)=>{
    try {
        const instituteNumber = req.user?.currentInstituteNumber;
        const {categoryName,categoryDescription} = req.body;
        console.log('Incoming category creation request:', req.body);
        if(!categoryName || !categoryDescription){
            return res.status(400).json({
                message : "Please provide categoryName, categoryDescription"
            });
        }
        try {
            await sequelize.query(`INSERT INTO category_${instituteNumber}(categoryName,categoryDescription) VALUES(?,?)`,{
                type : QueryTypes.INSERT,
                replacements : [categoryName,categoryDescription]
            });
            const [CategoryData]:{id:string,createdAt:Date}[] = await sequelize.query(`SELECT id,
                createdAt from category_$(instituteNumber) WHERE categoryName=?`,{
            replacements:[categoryName],
            type:QueryTypes.SELECT})
            console.log(CategoryData)
            res.status(200).json({
                message : "Category added successfully",
                categoryName,
                categoryDescription,
                id:CategoryData.id,
                CreatedAt:CategoryData.createdAt
            });
        } catch (err:any) {
            console.error('Error inserting category:', err);
            if (err.original && err.original.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ message: 'Category name must be unique.' });
            }
            res.status(500).json({ message: 'Error creating category', error: err.message });
        }
    } catch (err:any) {
        console.error('Unexpected error in createCategory:', err);
        res.status(500).json({ message: 'Unexpected error', error: err.message });
    }
}

const getCategories = async(req:IExtendedRequest,res:Response)=>{
    const instituteNumber = req.user?.currentInstituteNumber
    const categories = await sequelize.query(`SELECT * FROM category_${instituteNumber}`,{
        type : QueryTypes.SELECT
        // tapaile kasto type ko operation garnu vako ho tyo dinu paryo
    })
    res.status(200).json({
        message : "Categories fetched successfully",
        data : categories
    })
}

const deleteCategory = async(req:IExtendedRequest,res:Response)=>{
    const instituteNumber = req.user?.currentInstituteNumber
    const id = req.params.id
    await sequelize.query(`DELETE FROM category_${instituteNumber} WHERE id = ?`,{
        type : QueryTypes.DELETE,
        replacements : [id]
    })
    res.status(200).json({
        message : "Category deleted successfully"
    })
}

export {createCategory,getCategories,deleteCategory}
