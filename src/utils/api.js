import axios from 'axios'

const api = axios.create({
    baseURL:"https://surveybackend-erv4.onrender.com/",
    withCredentials:true

})

export default  api