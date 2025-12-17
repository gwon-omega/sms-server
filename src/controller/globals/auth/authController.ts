import {Request,Response} from "express"
import User from "../../../database/models/userModel"
import bcrypt from "bcrypt"
import generateJWTToken from "../../../services/generateJwtToken"
// json data --> req.body // username,email,password
// files --> req.file // files
// const registerUser = async (req:Request,res:Response)=>{
// //    const username = req.body.username
// //    const password = req.body.password
// //    const email = req.body.email
//     // incoming data --> accept
//    const {username,password,email} = req.body
//    if(!username || !password || !email){
//      res.status(400).json({
//         message : "Please provide username, password, email"
//     })
//     return
//    }
//     // insert into Users table
//     await User.create({
//         username :username,
//         password : password,
//         email : email
//     })
//     res.status(200).json({
//         message : "User registered successfully"
//     })


// } // function
// BOLA Attack

/*
login flow :
email/username, password (basic)
email , password -- data accept --> validation -->
// first check email exist or not (verify) --> yes --> check password now --> mil0-->
token generation (jsonwebtoken)

--> now --> not registered



google login, fb, github (oauth)
email login (SSO)

*/

class AuthController{
   static async registerUser(req:Request,res:Response){

    if(req.body == undefined){
        console.log("triggereed")
        res.status(400).json({
            message  : "No data was sent!!"
        })
        return
    }
    const {username,password,email} = req.body
    if(!username || !password || !email){
      res.status(400).json({
         message : "Please provide username, password, email"
     })
     return
    }
//    const [data] =  await User.findAll({
//         where : {
//             email
//         }
//     })
//     if(data){
//         // already exists with that email
//     }
     // insert into Users table
     await User.create({
         userName :username,
         password : bcrypt.hashSync(password,12), //blowfish
         email : email
     })
     res.status(201).json({
         message : "User registered successfully"
     })
   }


   static async loginUser(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide email and password",
      });
    }

    // Check if user exists
    const data = await User.findAll({
      where: { email },
    });

    if (data.length === 0) {
      return res.status(404).json({
        message: "User not registered!",
      });
    }

    const user = data[0];

    // Compare password
    const isPasswordMatch = bcrypt.compareSync(password, user.password);

    if (!isPasswordMatch) {
      return res.status(403).json({
        message: "Invalid email or password",
      });
    }

    // Generate token
    const token = generateJWTToken({ id: user.id });

    // Success response
    return res.status(200).json({
      data: {
        token,
        username: user.userName,
      },
      message: "Login successful",
    });

  } catch (error) {
    console.error("🔥 Login error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
   }
}



export default AuthController


// export  {registerUser}



// token(jwt), session
// cookie, localstorage
