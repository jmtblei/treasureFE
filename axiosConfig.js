require('dotenv').config();
const axios = require('axios');

module.exports = axios.create({
    baseURL: 'https://lambda-treasure-hunt.herokuapp.com/api/adv/',
    headers: {
        Authorization: `Token ${process.env.API_KEY}`
    }
})