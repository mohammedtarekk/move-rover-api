///////////// REST API CONSTRUCTION /////////////
const express = require('express');
const app = express();
app.use(express.json());

app.get('/reset', (req, res) => {
    const result = resetCoordinates();
    res.send(result);
});

app.get('/getCoordinates', (req, res) => {
    const result = getCoordinates();
    res.send(result);
});

app.get('/moverover/:command', (req, res) => {
    const validationResult = inputValidation(req.params.command);
    if(validationResult)
        res.send([validationResult]); 
    else{
        const result = moveRover(req.params.command);
        res.send(result);
    }
});

app.get('/moverover', (req, res) => {
    const validationResult = inputValidation(req.body.command);
    if(validationResult)
        res.send([validationResult]); 
    else{
        const result = moveRover(req.body.command);
        res.send(result);
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
/////////////////////////////////////////////////

// A map is used to map the movement angles to string directions
const directionsMap = {
     0: "EAST",
     90: "NORTH",
     180: "WEST",
     270: "SOUTH"
  };

const obstacles = [
    [1, 4],
    [3, 5],
    [7, 4]
];

// global static rover coordinates
var x = 4;
var y = 2;
var theta = 0;

function getCoordinates(){
    return [x, y, directionsMap[theta]]
}

// This function will be called once after the api is fetched
function resetCoordinates(){
    x = 4;
    y = 2;
    theta = 0;
    return [x, y, directionsMap[theta]]
}

function inputValidation(input){    
    
    // 1. check null value
    if(!input)
        return "You should enter a command";

    // 2. check if there is any char that is not recognizable
    input = input.toUpperCase();
    for(let i=0;i<input.length;i++){
        if(input[i] != 'F' && input[i] != 'L' && input[i] != 'R' && input[i] != "B")
            return `${input[i]} is not recognizable`;
    }
}

function moveRover(command){
    command = command.toUpperCase();

    // looping on the command instructions to execute them one by one
    for(let i=0;i<command.length;i++){
        oldX = x;
        oldY = y;
        isStopped = false;

        if(command[i] == 'F'){
            [x, y] = F(x, y, theta);
            if(obstacles.findIndex(obs => JSON.stringify(obs) === JSON.stringify([x, y])) != -1){
                x = oldX;
                y = oldY;
                isStopped = true;
                break;
            }
        }          

        if(command[i] == 'B'){
            [x, y] = B(x, y, theta);
            if(obstacles.findIndex(obs => JSON.stringify(obs) === JSON.stringify([x, y])) != -1){
                x = oldX;
                y = oldY;
                isStopped = true;
                break;
            }
        }

        if(command[i] == 'R')
            theta = R(theta);
        
        if(command[i] == 'L')
            theta = L(theta);
    }

    // map the angle to its string direction value
    const heading = directionsMap[theta];
   
    // check if stopped
    isStopped = isStopped ? "STOPPED" : ""; 

    // returning the final result
    return [x, y, heading, isStopped];
}

// Move forward on current heading
function F(x, y, theta){
    x = x + (theta == 270 ? 0 : Math.floor(Math.cos(theta * (Math.PI / 180.0))));
    y = y + Math.floor(Math.sin(theta * (Math.PI / 180.0)));
    return [x, y];
}

// Move backwards on current heading
function B(x, y, theta){
    x = x - (theta == 270 ? 0 : Math.floor(Math.cos(theta * (Math.PI / 180))));
    y = y - Math.floor(Math.sin(theta * (Math.PI / 180)));
    return [x, y];
}

// Rotate left by 90 degrees
function L(theta){
    let newTheta = theta + 90;
    if(newTheta == 360)
        newTheta = 0;
    if(newTheta > 360)
        newTheta = newTheta - 360;
    return newTheta;
}

// Rotate right by 90 degrees
function R(theta){
    let newTheta = theta - 90;
    if(newTheta < 0)
        newTheta = 360 - (newTheta * -1);
    return newTheta;
}