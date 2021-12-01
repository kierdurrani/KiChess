function makeMove2(){
	// Selects Random Legal Move
	var possStates = childstates();
	var randomMove = possStates[ Math.floor(Math.random() * (possStates.length - 1))];
	
	console.log("makeMove");
	console.log(randomMove);
	gamestate = randomMove.split('|')[0];
	extendedState =  JSON.parse(randomMove.split('|')[1]);
	renderBoard(gamestate);
}

var analysedMove = {
	NiaveScore: 0,
	DeepScore: 0,
	Depth: 0,
	ChildStates: [],
	ParentStates: [], // is this necessary?
	SerializedState: ""
}

function makeMove(){
	// Greedy best score next move;
	console.log("first order makeMove");
	var possStates = childstates();
	
	// shuffle states
	possStates = possStates
		.map((value) => ({ value, sort: Math.random() }))
		.sort((a, b) => a.sort - b.sort)
		.map(({ value }) => value)

	var bestState;
	var bestScore;
	var bestExtendedState;
	for(var possState of possStates ){
		
		var posGamestate  = possState.split('|')[0];
		var posExtendedState = JSON.parse(possState.split('|')[1]);
		
		var posScore = calculateMaterialScore(posGamestate, posExtendedState);
		
		if(extendedState.isWhitesTurn ){
			// white wants 
			if( (posScore > bestScore) || (bestScore == null) ){
				bestScore = posScore;
				bestState = posGamestate;
				bestExtendedState = posExtendedState;
			}
		}else{
			// black wants to find lowest score;
			if( (posScore < bestScore) || (bestScore == null) ){
				bestScore = posScore;
				bestState = posGamestate;
				bestExtendedState = posExtendedState;
			}
		}
	}
	
	extendedState =  bestExtendedState;
	gamestate = bestState;
	renderBoard(gamestate);
}


var AllAnalysedStates = {};
function calculateBestMove(depth, startingTotalState, startingExtendedState){
	
	 // creates an object / dictionary
	var startingAnalysed = {
		NiaveScore: calculateMaterialScore(startingBoardState, startingExtendedState),
		DeepScore: null,
		Depth: 0,
		ChildStates: getAllChildStates(startingBoardState, startingExtendedState), // TODO, child states
		StateString:(startingTotalState + '|' + JSON.stringify(startingExtendedState) )
	}
	
	
	AllAnalysedStates[startingAnalysed.StateString.hashCode()] = [startingAnalysed];
	for(var bestChildState of AllAnalysedStates ){
		
		
	}
	
	// getAllChildStates
}

function calculateScoreToDepth(depth, ){
	
}


function calculateMaterialScore(gamestate, extendedState){
	let score = 0;
	
	if(amIInCheck(gamestate, extendedState.isWhitesTurn)){
		if(extendedState.isWhitesTurn){
			score = 0;
		}else{
			score = 0;
		}
		
		// If in state/checkmate:
		var legalMoves = existsLegalMoves(gamestate, extendedState);
		if(!legalMoves){
			if(amIInCheck(gamestate, extendedState.isWhitesTurn)){
				// checkmate
				if(extendedState.isWhitesTurn){ return -1000;
				}else{ 							return +1000; }
			}else{
				// stalemate score is zero
				return 0; 
			}
		}
	}

	for (let x = 0; x < 72 ; x++) {
		if(gamestate[x] === '_' | gamestate[x] === ';'  ){continue;}
		switch(gamestate[x]) {
			case 'p':	score = score + 1;
			break;
			case 'P':	score = score - 1;
			break;
			case 'r':	score = score + 5;
			break;
			case 'R':	score = score - 5;
			break;
			case 'q':	score = score + 9;
			break;
			case 'Q':	score = score - 9;
			break;
			case 'b':	score = score + 3;
			break;
			case 'B':	score = score - 3;
			break;
			case 'n':	score = score + 3;
			break;
			case 'N':	score = score - 3;
			default:
		}
	}
	return score;
}

// Utility Functions
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


