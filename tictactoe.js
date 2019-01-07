var player;
var compPlayer;
window.addEventListener("load", choosePlayer);

var modalBackground = document.getElementById("modal-background");

function choosePlayer(){
  modalBackground.style.display = "block";
}

var chooseX= document.getElementById("X");
var chooseO= document.getElementById("O");

chooseX.addEventListener("click", closeModalX, false);
chooseO.addEventListener("click", closeModalO, false);

function closeModalX() {
  player = "X";
  compPlayer = "O";
  modalBackground.style.display = "none";
}

function closeModalO() {
  player = "O";
  compPlayer = "X";
  modalBackground.style.display = "none";
}

var remaining = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// keeps a record of which tiles the user has played
var playerLocations = [];
var compLocations = [];

// all possible winning tile combinations
var winningCombinations = [[1,2,3],[4,5,6],[7,8,9],[1,4,7],[2,5,8],[3,6,9],[3,5,7],[1,5,9]];

// tallies how many tiles the player has that match to a winning combo
var winScore = 0;
var nextMove = 0;

// listens for the player clicking a box
var listener = document.getElementById("container");
listener.addEventListener("click", boxClick, false);

// when the player clicks the box
function boxClick(box) {
  // if the of the object clicked is not that of the whole screen...
  if (box.target !== box.currentTarget) {
    // get the id of that object
    var clickedBox = (box.target.id);
    var boxNum = parseInt(clickedBox.slice(1));
    if(remaining.indexOf(boxNum) > -1){
      // stick an X in the box
      listener.removeEventListener("click", boxClick, false);
      document.getElementById(clickedBox).innerHTML = player;
      // add that tile to the player's list of tiles
      playerLocations.push(boxNum);
      remaining = remaining.filter(element => element != boxNum);
      console.log(remaining);
      if(remaining.length === 0){
        endGame();  
      }
    } else return;
  } 
  box.stopPropagation();
  console.log("player moves so far: ", playerLocations);
  if(playerLocations.length > 2){
    checkForWin(playerLocations);
  }
  // make sure the game is still going before letting the computer make another move
  if(winScore !== 3 && remaining.length > 0){
    finalMove(compLocations);
    setTimeout(compTurn, 1000);
  }
}

function compTurn(){
  var compNum;
  if(nextMove > 0){
    compNum = nextMove;
  } else {  
    // pick a random square
    compNum = remaining[Math.floor(Math.random()*remaining.length)];
  }
  compLocations.push(compNum);
  // update which squares are now available
  remaining = remaining.filter(element => element != compNum);
  console.log("c", remaining);
  var compClick = "d" + compNum;
  // put an O in the chosen box
  document.getElementById(compClick).innerHTML = compPlayer;
  if(compLocations.length > 2){
    checkForWin(compLocations);
  }
  // finalMove(compLocations);
  listener.addEventListener("click", boxClick, false);
}

function checkForWin(player){
  // go through the list of winning combos
  for(var i = 0; i < winningCombinations.length; i++){
    // and go through the numbers in the tiles the player has clicked 
    for(var j = 0; j < player.length; j++){
      // go through the numbers in each winning combination
      for(var k = 0; k < 3; k++){
        // if the current entry in the current combo is the same as the current player tile number, this is a winner
        if(winningCombinations[i][k] === player[j]){
          winScore++;
          if(winScore === 3) {
            console.log("Win!");
            winLight(winningCombinations[i]);
            setTimeout(()=> soreLoser.loadPoints(compLocations), 500);
            endGame();
            return;
          } 
        } 
      } 
    } 
    winScore = 0;
  } 
}

function finalMove(comp){
  // if the computer two of any entry in winningCombinations and the remaining spot is blank, put a mark
  var finScore = 0;
  // go through the list of winning combos
  for(var i = 0; i < winningCombinations.length; i++){
    // and go through the numbers in the tiles the player has clicked 
    for(var j = 0; j < comp.length; j++){
      // go through the numbers in each winning combination
      for(var k = 0; k < 3; k++){
        if(winningCombinations[i][k] === comp[j]){
          finScore++;  
        }
        if(finScore === 2) {
          console.log("the array you're looking for: ", winningCombinations[i]);
          var spot = winningCombinations[i].filter(element => comp.indexOf(element) === -1);
          // check that nextMove is still available in the remaining array
          if(remaining.indexOf(spot[0]) > -1){
            nextMove = spot[0];
          }
        }
      }  
    } finScore = 0;
  } 
}


// light up the squares with the winning streak 
function winLight(range){
  for(var element = 0; element < range.length; element++){
    var square = "d"+range[element];
    document.getElementById(square).style = "background-color: red;box-shadow: 0 0 10px red; text-shadow: 0 0 5px black;";
  }
}

function endGame(){
  console.log("game over");
  // stop the player from playing
  listener.removeEventListener("click", boxClick, false);
  // load a restart button under the game
  var reset = document.getElementById("restart");
  reset.style.visibility = "visible";
  reset.style.cursor = "pointer";
  // when the player clicks, the game restarts 
  reset.addEventListener("click", reload, false);
}

function reload(){
  window.location.reload(true);
}

class ScribbleCanvas {
  // this acts as the init for the canvas
  constructor(){
    this.canvas = document.getElementById("scribble");
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    requestAnimationFrame(evt => this.update(evt));
    this.points = [];
    this.jitterAmount = 5;
    this.offset = 0;
    this.totalDistance = 0;
    this.scribbleSpeed = 35;
  } 
  update(){
    // this is the graphics context
    var g = this.canvas.getContext("2d"); 
    g.clearRect(0, 0, this.canvas.width, this.canvas.height);
    g.strokeStyle = "maroon";
    g.lineWidth = 5;
    g.lineJoin = "round";
    g.beginPath();
    g.setLineDash([this.totalDistance]);
    this.offset = Math.max(0, this.offset - this.scribbleSpeed * Math.pow(Math.random(), 5));
    g.lineDashOffset = this.offset;
    for(var i = 0; i < this.points.length; i++){
      var p = this.points[i];
      g.lineTo(p.x, p.y);
    } 
    g.stroke();
    // update loop, happens every frame foreverrr
    requestAnimationFrame(evt => this.update(evt));  
  }
  loadPoints(moves){
    // go through the loser's moves
    this.points = moves.map(id => document.getElementById("d" + id))
    .map(div => div.getBoundingClientRect())
    .map(rect => {
      var x = rect.x + rect.width/2; 
      var y = rect.y + rect.height/2;
      return {
        x,
        y
      };
    });
    var tempPoints = [];
    for(var i = 0; i < this.points.length - 1; i++){
      var a = this.points[i];
      var b = this.points[i+1];
      var currentDistance = distanceBetween(a, b);
      var segments = currentDistance/5;
      for(var j = 0; j < segments; j++){
        var f = j/segments;
        var midPoint = lerp(a, b, f);
        midPoint.x += this.jitterAmount * Math.pow(Math.random(), 5);
        midPoint.y += this.jitterAmount * Math.pow(Math.random(), 5);
        tempPoints.push(midPoint);
      }
    }
    console.log(this.points);
    this.totalDistance = 0;
    this.points = tempPoints;
    for(var i = 0; i < this.points.length - 1; i++){
      this.totalDistance += distanceBetween(this.points[i], this.points[i+1]);
      this.offset = this.totalDistance;
    }
  }
  
}

function distanceBetween(a, b){
  var dx = a.x - b.x;
  var dy = a.y - b.y;
  var distance = Math.sqrt(dx*dx+dy*dy);
  return distance;
}

function lerp(a, b, f){
  // complement
  var g = 1-f;
  return {
    x: a.x*g + b.x*f,
    y: a.y*g + b.y*f
  };
  
}

var soreLoser = new ScribbleCanvas();

