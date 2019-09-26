const advAxios = require('./axiosConfig');
const axios = require('axios')

// global variables
let currentRoom = null;
let cooldown = 20;

// initializing the game
advAxios
    .get('init')
    .then(res => {
        console.log('initializing', res.data);
        // set the current room to res.data
        currentRoom = res.data;
        cooldown = currentRoom.cooldown
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

let treasureItems = [];

function loopRooms() {
    let roomNum = currentRoom.room_id
    // add the current room's id to our graph and add it as a new key
    if (!graph[roomNum]) {
        graph[roomNum] = {};
    }
    // add the exits of current room id to graph
    currentRoom.exits.forEach(exit => {
        // if the exit is not listed, add the value as "?" to signify not traversed
        if (graph[roomNum][exit] == undefined) {
            graph[roomNum][exit] = "?"
        }
    });

    console.log('list of rooms traversed', graph);
    console.log('number of rooms traversed', Object.keys(graph).length);


    // collect list of directions in current room id that hasn't been traversed yet (has value of "?")
    let directions = [];
    for (let key in graph[roomNum]) {
        if (graph[roomNum][key] == "?") {
            directions.push(key);
        }
    }
    
    // traversing rooms
    if (directions.length > 0) {
        // get our next move from first path in directions and reset directions for the next room
        let nextMove = directions[0];
        directions = [];
        // record the back movement and push it to backwardsPath
        let backMove = backwards(nextMove);
        backwardsPath.push(backMove);

        traversalPath.push(nextMove);
        // send the post request to move
        setTimeout(() => { // have to settimeout bc there is a cooldown to make request to move again
            advAxios
                .post('move', { direction: nextMove})
                .then(res => {
                    console.log('moving to a room', res.data)
                    // save the previous room's id and set it to the current
                    let prevRoom = roomNum
                    currentRoom = res.data;
                    treasureItems = res.data.items;
                    console.log("treasure items", treasureItems)
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
                    });
                    // update graph with for current room with prevRoom
                    graph[newRoom][backMove] = prevRoom;
                    // gets the cooldown of the specific room
                    cooldown = currentRoom.cooldown 
                    // recursively traverses
                    if (Object.keys(graph).length !== 500) {
                        console.log("there's still more rooms to explore");
                        setTimeout(() => {
                            loopRooms();
                        }, cooldown * 1000); // waits room cooldown * 1s before sending post request again
                    }
                })
                // .then((res) => {
                //     console.log("take Response", res.data)
                // }) 
                .catch(err => console.log(err.message));
        }, cooldown * 10000);
    }
    // handle dead ends
    else if (directions.length == 0 && backwardsPath.length) {
        console.log("this is a dead end or i've already visited this room. tracing my steps backwards now");
        // save the last move and add the backwards move to the end of traversePath
        let lastMove = backwardsPath.pop()
        traversalPath.push(lastMove);
        // save the room id we're moving to as string for wise explorer
        let lastRoom = graph[roomNum][lastMove].toString();
        console.log("lastRoom", lastRoom)
        // send post request to continue moving
        setTimeout(() => {
            advAxios
                .post('move', { direction: lastMove, next_room_id: lastRoom })
                .then(res => {
                    // set our current room
                    currentRoom = res.data;
                    cooldown = res.data.cooldown;
                    console.log("i moved back, i'm now in room:", currentRoom.room_id, "i can move again in:", cooldown)
                    // recursively traverses
                    if (Object.keys(graph).length !== 500) {
                        console.log("that was a dead end. let's go another direction");
                        setTimeout(() => {
                            loopRooms();
                        }, cooldown * 1000);
                    }
                })
                .catch(err => console.log(err.message))
        }, cooldown * 1000) 
    }
    else if (directions.length == 0 && backwardsPath.length == 0) {
        console.log("this is the end of the road", Object.keys(graph).length);
        return graph;
    }
}



// set timeout; rooms need to initialize and load before moving
setTimeout(() => { 
    loopRooms();
    console.log("treasureItems in array : ", treasureItems)
    
    axios.all([
            advAxios.post('take', {"name": "treasure"}),
            advAxios.post('status')
        ])
        .then(axios.spread((takeRes, statusRes) => {
            console.log("treasure take res: ", takeRes.data)
            console.log("status res: ", statusRes.data)
        }))
        .catch(err => console.log(err.message))
    
}, cooldown * 1000);
