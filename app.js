const advAxios = require('./axiosConfig');

// initializing the game
advAxios
    .get('init')
    .then(res => {
        console.log('initializing', res.data)
    })
    .catch(err => console.log('init error', err));

// create new list to record traversal path
let traversalPath = [];

// create empty graph
let graph = {};

// define direction to go back upon dead end
function backwards(dir) {
    let result = "";
    if (dir == "n") {
        result = "s";
    } else if (dir = "e") {
        result = "w";
    } else if (dir = "s") {
        result = "n";
    } else if (dir = "w") {
        result = "e";
    }
    return result
}

// create new list to record backwards movement
let backwardsPath = [];