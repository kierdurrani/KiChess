function makeMove(){
	var possStates = childstates();
	var randomMove = possStates[ Math.floor(Math.random() * (possStates.length - 1))];
	
	console.log("makeMove");
	console.log(randomMove);
	gamestate = randomMove.split('|')[0];
	extendedState =  JSON.parse(randomMove.split('|')[1]);
	renderBoard(gamestate);
}

function calculateNextMove(gamestate, extendedState){
	
	if(extendedState.isWhitesTurn){
		
	}

	if(extendedState.isWhitesTurn){
		referenceState = gamestate.toLowerCase();
	}else{
		referenceState = gamestate.toUpperCase();
	}
	
	// get all possible next moves

	
	
}


var time = 0;
function start(){
    time = Date.now();
}
function lap() {
    var delta = Date.now() - time; // milliseconds elapsed since start
    
    console.log("TIME ELAPSED: " + delta);
};

String.prototype.hashCode = function hash() {
  var hash = 0, i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};


function getAllChildStates(gamestate, extendedState){
	start();
	var allPossibleMoves = []
	
	// var JSON.parse(JSON.stringify(extendedState));
	
	var referenceState;
	if(extendedState.isWhitesTurn){
		referenceState = gamestate.toLowerCase();
	}else{
		referenceState = gamestate.toUpperCase();
	}
	
	for (let x = 0; x < 72 ; x++) {
		if(referenceState[x] === '_' | referenceState[x] === ';'  ){continue;}
		if(referenceState[x] === gamestate[x]){
			// indicates is allied piece.
			// TODO: calculate coords
			console.log(x);
			var letterCoord =  (x % 9) + 1 ;
			var numberCoord =  (8 -  Math.floor(x / 9));
			var currentPieceCoords = String.fromCharCode(letterCoord + 96) + numberCoord;
			console.log(x + "<- int, coords-> " + currentPieceCoords);
			let legalMoves = getLegalMoves(currentPieceCoords);
			console.log(legalMoves);
			for (const move of Object.keys(legalMoves)) {
				
				allPossibleMoves = allPossibleMoves.concat( legalMoves[move].gamestate + "|" + JSON.stringify(legalMoves[move].extendedState));
				// TODO, case of promotion!
			}
		}
	}
	lap();
	return allPossibleMoves;
}



function childstates(){
	return getAllChildStates(gamestate, extendedState);
}
// Best move is the one which results in the gamestate with the highest score.
// Best(state) = max( {children(state)} )

// Score(state) = 


