require('dotenv').config();
const axios = require('axios');

module.exports = axios.create({
    baseURL: 'https://lambda-treasure-hunt.herokuapp.com/api/bc/',
    headers: {
        Authorization: `Token ${process.env.API_KEY}`
    }
})