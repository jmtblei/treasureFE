const advAxios = require('./axiosConfig');

// initializing the game
advAxios
    .get('init')
    .then(res => {
        console.log('initializing', res.data)
    })
    .catch(err => console.log('init error', err));