import axios from "axios";

const teacherApi = axios.create({
    baseURL : "http://localhost:4000/api/teacher", 
    headers : {
        "Content-Type" : "application/json", 
        "Accept" : "application/json"
    }
})


export default teacherApi 
