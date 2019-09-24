const advAxios = require('./axiosConfig');

// global variables
let currentRoom = null

// initializing the game
advAxios
    .get('init')
    .then(res => {
        console.log('initializing', res.data);
        // set the current room to res.data
        currentRoom = res.data
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

// looping all rooms until we traverse all 500 rooms

function loopRooms() {
    // add the current room's id to our graph and add it as a new key
    if (!graph[currentRoom.room_id]) {
        graph[currentRoom.room_id] = {};
    }
    // add the exits of current room id to graph
    currentRoom.exits.forEach(exit => {
        // if the exit is not listed, add the value as "?" to signify not traversed
        if (graph[currentRoom.room_id][exit] == undefined) {
            graph[currentRoom.room_id][exit] = "?"
        }
    });

    // collect list of directions in current room id that hasn't been traversed yet (has value of "?")
    let directions = [];
    for (let key in graph[currentRoom.room_id]) {
        if (graph[currentRoom.room_id][key] == "?") {
            directions.push(key);
        }
    }
    
    // traversing rooms
    if (directions.length > 0) {
        // get our next move from first path in directions and reset directions for the next room
        let nextMove = directions[0];
        directions = [];

        traversalPath.push(nextMove);
        // send the post request to move
        advAxios
            .post('move', { direction: nextMove})
            .then(res => {
                console.log('moving to a room', res.data)
                // save the previous room's id and set it to the current
                let prevRoom = currentRoom.room_id
                currentRoom = res.data;
                // update the value in graph of prevRoom
                graph[prevRoom][nextMove] = currentRoom.room_id;
                let newRoom = currentRoom.room_id;
                // add new room id to graph
                if (!graph[newRoom]) {
                    graph[newRoom] = {};
                }
                // add the value of exits for newRoom
                currentRoom.exits.forEach(exit => {
                    if (!graph[newRoom][exit]) {
                        graph[newRoom][exit] = "?";
                    }
                })
            })
            .catch(err => console.log(err.message));
    }
}

// set timeout; rooms need to initialize and load before moving
setTimeout(() => { 
    loopRooms();
}, 20000);