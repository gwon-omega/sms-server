import { NextFunction, Request, Response } from "express"
import jwt from 'jsonwebtoken'
import User from "../database/models/user.model"
import { IExtendedRequest, UserRole } from "./type"

const isLoggedIn = async (req:IExtendedRequest,res:Response,next:NextFunction)=>{

  /*
   req =  {
  body : ""
  headers : "", 
  contenttype : "", 
  name : "manish", 
  user : {
  email : "manish", 
  role : "admin", 

  }
  }

  req.

  */
    // check if login or not 
    // token accept 
    const token = req.headers.authorization //jwt eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30

    if(!token){
        res.status(401).json({
            message : "please provide token"
        })
        return
        
    }
    // verify garne 
    jwt.verify(token,'thisissecret',async (erroraayo,resultaayo : any)=>{
        if(erroraayo){
            res.status(403).json({
                message : "Token invalid vayooo"
            })
        }else{
            // verified vayo 
           
        //    const userData = await User.findAll({
        //         where : {
        //             id : resultaayo.id
        //         }
        //     })
            const userData = await User.findByPk(resultaayo.id,{
                attributes : ['id','currentInstituteNumber', 'role']
            })
            /*

            userData = {
                id  : "", 
                currentInstituteNumber : ""
                            }
            */
            if(!userData){
                res.status(403).json({
                    message : "No user with that id, invalid token "
                })
            }else{
                req.user = userData
                next()
            }
        }
    })
}


const changeUserIdForTableName = (req:IExtendedRequest,res:Response,next:NextFunction)=>{
    console.log(req.user,"Req user outside")
    if(req.user && req.user.id){
         const newUserId =  req.user.id.split("-").join("_") 
         req.user = {id:newUserId,role:req.user.role}
         console.log(req.user,"RequserId")
        //  console.log(req.user?.id.split("-").join("_") ,"data")
        next()
        }

}

const restrictTo = (...roles:UserRole[])=>{ // ["teacher","super-admin","institute"]
    return (req:IExtendedRequest,res:Response,next:NextFunction)=>{
        // requesting user ko role k xa tyo liney ani parameter aako role sanga match garne 
        let userRole = req.user?.role as UserRole // teacher
        console.log(req.user?.role,"restrict o")
        if(roles.includes(userRole)){
            next()
        }else{
            res.status(403).json({
                message : "Invalid, you dont have access to this.."
            })
        }
    }
}

// class Middleware{
//     static isLoggedIn(req:IExtendedRequest,res:Response,next:NextFunction){
//         // check if login or not 
//         // token accept 
//         const name = "manish basnet"
//         const token = req.headers.authorization //jwt eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30
//         console.log(token,"TOKEN")
//         if(!token){
//             res.status(401).json({
//                 message : "please provide token"
//             })
//             return
//         }
//         // verify garne 
//         jwt.verify(token,'thisissecret',async (erroraayo,resultaayo : any)=>{
//             if(erroraayo){
//                 res.status(403).json({
//                     message : "Token invalid vayooo"
//                 })
//             }else{
//                 // verified vayo 
               
//             //    const userData = await User.findAll({
//             //         where : {
//             //             id : resultaayo.id
//             //         }
//             //     })
//                 const userData = await User.findByPk(resultaayo.id)
//                 if(!userData){
//                     res.status(403).json({
//                         message : "No user with that id, invalid token "
//                     })
//                 }else{
//                     req.user.name = name
//                     req.user.age = 23
//                 }
//             }
//         })
//         next()
//     }

//     static restrictTo(req:Request,res:Response,next:NextFunction){
       
//     }
// }


export {isLoggedIn,restrictTo,changeUserIdForTableName}