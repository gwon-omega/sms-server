import { QueryTypes } from "sequelize";
import sequelize from "../../../database/connection";
import User from "../../../database/models/userModel";
import { IExtendedRequest } from "../../../middleware/type";
import { Response } from "express";
import { getSequelizeTypeByDesignType } from "sequelize-typescript";
import { KhaltiPayment } from "./paymentIntegration";
import axios from "axios";
import generateSha256Hash from "../../../services/generateSha256Hash";
import base64 from 'base-64'

// upload.fields([{ name: 'avatar1', maxCount: 1 }, {name:'avatar2', maxCount:1},{name:'avatar3', maxCount : 1}]

//


enum PaymentMethod{
    COD = "cod",
    ESEWA = "esewa",
    KHALTI = "khalti"
}


enum VerificationStatus{
    Completed = "Completed",

}

const createStudentCourseOrder = async(req:IExtendedRequest,res:Response)=>{
    const userId = req.user?.id
    console.log(userId,"UserID")
    const notChangedUserId = req.user?.id.split("_").join("-")
    const userData = await User.findByPk(notChangedUserId)
    const {whatsapp_no, remarks,paymentMethod, amount} = req.body
    const orderDetailsData:{
        courseId : string ,
        instituteId : string
    }[] = req.body.orderDetails
    if(orderDetailsData.length === 0 ) return res.status(400).json({
        message : "Please send the course you want to purchase!!!"
    })

    if(!whatsapp_no || !remarks){
        return res.status(400).json({
            message : "Please provide whatsapp_no, remarks"
        })
    }

    /*

    whatsapp no, payment({
    paymentMethod : cod|esewa|khalti,
    paymentStatus : paid|unpaid|pending
    })

    MERN STACK =

    [
    {
    courseId : "Mernstack_123123",
    instituteId : "123123"
    },{
    cousreId : "laravel_123123",
    instituteId : "123123"
    }
    ]


    */
   await sequelize.query(`CREATE TABLE IF NOT EXISTS student_order_${userId}(
            id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
            email VARCHAR(25) NOT NULL,
            whatsapp_no VARCHAR(26) NOT NULL,
            remarks TEXT,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`)

    // order-details
    await sequelize.query(`CREATE TABLE IF NOT EXISTS student_order_details_${userId}(
          id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
            courseId VARCHAR(36) ,
            instituteId VARCHAR(36),
            orderId VARCHAR(100),
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`)

    await sequelize.query(`CREATE TABLE IF NOT EXISTS student_payment_${userId}(
         id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
            paymentMethod ENUM('esewa','khalti','cod'),
            pidx VARCHAR(26),
            transaction_uuid VARCHAR(150),
            paymentStatus ENUM('paid','pending','unpaid') DEFAULT('unpaid'),
            totalAmount VARCHAR(10) NOT NULL,
            orderId VARCHAR(100),
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`)
        // insert query
        console.log(userData,"userData")
       const data =  await sequelize.query(`INSERT INTO student_order_${userId}(whatsapp_no,remarks,email) VALUES(?,?,?)`,{
            type  : QueryTypes.INSERT,
            replacements : [whatsapp_no,remarks,userData?.email]
        })
    const [result]: {id : {
        id : string
    }}[] =  await sequelize.query(`SELECT id FROM student_order_${userId} WHERE whatsapp_no = ? AND remarks = ?`,{
        type : QueryTypes.SELECT,
        replacements : [whatsapp_no,remarks]
     })

     console.log(result.id,"Result")
        console.log(data,"Dataaaaa")
        for(let orderDetail of orderDetailsData){
            await sequelize.query(`INSERT INTO student_order_details_${userId}(courseId,instituteId, orderId) VALUES(?,?,?)`,{
                type : QueryTypes.INSERT,
                replacements : [orderDetail.courseId,orderDetail.instituteId, result.id]
            })
        }

        let pidx;
        if(paymentMethod === PaymentMethod.ESEWA){
            const{amount,} = req.body
            const paymentData = {
                 tax_amount : 0,
                 product_service_charge : 0,
                 product_delivery_charge : 0 ,
                 product_code : process.env.ESEWA_PRODUCT_CODE,
                 amount : amount,
                 total_amount : amount,
                 transaction_uuid : userId + "_" + orderDetailsData[0].courseId,
                 success_url : "http://localhost:3000/",
                 failure_url  : "http://localhost:3000/failure",
                 signed_field_names : "total_amount,transaction_uuid,product_code"
            }

//             const paymentData = {
// "amount": "100",
// "failure_url": "https://developer.esewa.com.np/failure",
// "product_delivery_charge": "0",
// "product_service_charge": "0",
// "product_code": "EPAYTEST",
// // "signature": "i94zsd3oXF6ZsSr/kGqT4sSzYQzjj1W/waxjWyRwaME=",
// "signed_field_names": "total_amount,transaction_uuid,product_code",
// "success_url": "https://developer.esewa.com.np/success",
// "tax_amount": "10",
// "total_amount": "110",
// "transaction_uuid": "2418285"
// }

            const data = `total_amount=${paymentData.total_amount},transaction_uuid=${paymentData.transaction_uuid},product_code=${paymentData.product_code}`

            console.log(data,"This is data")
            const esewaSecretKey = process.env.ESEWA_SECRET_KEY
            const signature = generateSha256Hash(data,esewaSecretKey as string)
            console.log(signature, esewaSecretKey,"This is signature")
            console.log(paymentData,"PaymentData")
           const response = await axios.post("https://rc-epay.esewa.com.np/api/epay/main/v2/form",{
            ...paymentData, signature
           },{
                headers : {
                    "Content-Type" : "application/x-www-form-urlencoded"
                }
            })

            console.log(response.request.res.responseUrl,"This is response")
            if(response.status === 200){
                    await sequelize.query(`INSERT INTO student_payment_${userId}(paymentMethod,totalAmount,orderId,transaction_uuid) VALUES(?,?,?,?)`,{
            type : QueryTypes.INSERT,
            replacements : [paymentMethod,amount,result.id,paymentData.transaction_uuid]
        })

                res.status(200).json({
                    message : "Payment initiated",
                    data : response.request.res.responseUrl
                })
            }

            // esewa integration function call here
        }else if(paymentMethod === PaymentMethod.KHALTI){

            // khalti integration function call here
         const response = await KhaltiPayment({
            amount : amount,
            return_url : "http://localhost:3000/",
            website_url : "http://localhost:3000/",
            purchase_order_id : orderDetailsData[0].courseId,
            purchase_order_name : "Order_" + orderDetailsData[0].courseId
         })
         if(response.status === 200){
            pidx = response.data.pidx
                await sequelize.query(`INSERT INTO student_payment_${userId}(paymentMethod,totalAmount,orderId,pidx) VALUES(?,?,?,?)`,{
            type : QueryTypes.INSERT,
            replacements : [paymentMethod,amount,result.id,pidx]
        })

             res.status(200).json({
                 message : "Takethis",
                 data : response.data
                })
            }else{
                res.status(200).json({
                    message : "Something went wrong, try again !!"
                })
            }


        }else if(paymentMethod === PaymentMethod.COD){
            // khalti integration function call here
        }else{
            // stripe
        }


}


const studentCoursePaymentVerification = async(req:IExtendedRequest,res:Response)=>{
    const {pidx} = req.body
    const userId = req.user?.id

    if(!pidx) return res.status(400).json({message : "Please provide pidx"})
        const response = await axios.post("https://dev.khalti.com/api/v2/epayment/lookup/",{pidx},{
    headers:{
        Authorization : "Key b68b4f0f4aa84599ad9b91c475ed6833"
    }})
    const data = response.data
    if(data.status === VerificationStatus.Completed){
        await sequelize.query(`UPDATE student_payment_${userId} SET paymentStatus=? WHERE pidx=?`,{
            type : QueryTypes.UPDATE,
            replacements : ['paid',pidx]
        })
        res.status(200).json({
            message : "Payment verified successfully"
        })
    }else{
        res.status(500).json({
            message : "Payment not verified!!"
        })
    }
}


const studentCourseEsewaPaymentVerification = async(req:IExtendedRequest,res:Response)=>{
    const {encodedData} = req.body
    const userId = req.user?.id
    if(!encodedData) return res.status(400).json({
        message : "Pleasr provide data base64 for verification"
    })


    const result = base64.decode(encodedData)
        const newresult:{
            total_amount : string,
            transaction_uuid : string
        } = JSON.parse(result)


    const response = await axios.get(`https://rc.esewa.com.np/api/epay/transaction/status/?product_code=EPAYTEST&total_amount=${newresult.total_amount}&transaction_uuid=${newresult.transaction_uuid}`)
    // console.log(response.data)
    if(response.status === 200 && response.data.status === "COMPLETE"){
  await sequelize.query(`UPDATE student_payment_${userId} SET paymentStatus=? WHERE transaction_uuid=?`,{
            type : QueryTypes.UPDATE,
            replacements : ['paid',newresult.transaction_uuid]
        })
        res.status(200).json({
            message : "Payment verified successfully"
        })
    }else{
        res.status(500).json({
            message : "Not verified"
        })
    }


}

export {createStudentCourseOrder,studentCoursePaymentVerification,studentCourseEsewaPaymentVerification}
