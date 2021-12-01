function makeMove(){

	var bestMoveAndScore = bestMoveToDepth((gamestate + "|" + JSON.stringify(extendedState)), 5);
	
	console.log("# States analysed: " + Object.keys(AllAnalysedStates).length);
	console.log("Score Estimate" + bestMoveAndScore);
	
	
	var stringRep = bestMoveAndScore.bestState;
	extendedState =  stringRep.split('|')[0];
	gamestate =  JSON.parse(stringRep.split('|')[1]);
	renderBoard(gamestate);
}

// Hashtable of lists of analysed States
var AllAnalysedStates = {};

// best move is the one with the best score.
// the score(state, depth) is defined as the best move of the children to depth - 1
// returns {bestState: bestState, bestScore: bestScore}
var global;
function bestMoveToDepth(startingState, depth){

	// See if state has already been analsed. If not, create the state in AllAnalysedStates
	var analysedStartingState = createOrGetAnalysedState(startingState);
	
	// If precalculated childstates exist, use that. otherwise calculate it.
	if(! analysedStartingState.ChildStates) { analysedStartingState.ChildStates = getAllChildStatesWrapper(startingState); }
	
	if(analysedStartingState.Depth >= depth){
		// This state has already been analysed to sufficient depth to just return the already calculated best move.
		// Also catches check and stalemates.
		return {bestState: analysedStartingState.BestChildState, bestScore: analysedStartingState.DeepScore};
	}
	
	var bestState;
	var bestScore;
	global = startingState;
	for(var possState of analysedStartingState.ChildStates){
		
		var analysedState = createOrGetAnalysedState(possState);
		
		if(analysedState.Depth < depth){
			// we have not analysed this state to sufficient depth, so analyse with recursive call!
			var moveAndScore = bestMoveToDepth(possState, (depth - 1));
			possState.DeepScore = moveAndScore.bestScore;
			possState.BestChildState = moveAndScore.bestState;
		}
		
		// Now we can be sure that we have already analysed this state to sufficient depth. Now we simply min_max
		if(possState.StateString[89] === 't' ){ // this is a quick and dirty equivalent to - if(extendedState.isWhitesTurn)
			// white wants to find highest score;
			if( (posScore > bestScore) || (bestScore == null) ){
				bestScore = posScore;
				bestState = posGamestate;
			}
		}else{
			// black wants to find lowest score;
			if( (posScore < bestScore) || (bestScore == null) ){
				bestScore = posScore;
				bestState = posGamestate;
			}
		}
	}
	analysedStartingState.Depth = depth;
	return {bestState: bestState, bestScore: bestScore};
}

function getAnalysedStates(stateString){
	var hashCode = stateString.hashCode();
	if(AllAnalysedStates[hashCode]){
		let foundState = AllAnalysedStates[hashCode].find(element => element.StateString === stateString );
		return foundState;
	}
	// AnalysedState does not exist in the global list of AllAnalysedStates:
	return null; 
}
function createOrGetAnalysedState(stateString){
	console.log(stateString);
	var hashCode = stateString.hashCode();
	if(AllAnalysedStates[hashCode]){
		
		let existing = AllAnalysedStates[hashCode].find(element => element.StateString === stateString );
		if(existing){ return existing;}
		
	}else{
		AllAnalysedStates[hashCode] = [];
	}
	
	var baseScore = calculateMaterialScoreWrapper(stateString);
	

	var AnalysedState = {
		DeepScore: baseScore,
		Depth: 0,
		ChildStates: null, 
		BestChildState: null,
		StateString: stateString
	}
	if( (baseScore > 1000) || (baseScore < -1000) ){
		// indicates checkmate/stalemate. 
		AnalysedState.Depth = 1000000;
		if(baseScore === 6969){
			// stalemate special code.
			AnalysedState.DeepScore = 0;
		}
		AnalysedState.ChildStates = [stateString]; // This is just to prevent 
	}
	AllAnalysedStates[hashCode].push(AnalysedState);
	
	return AnalysedState;
}


// Returns all states as a list in format: gamestate + "|" + JSON.stringify(extendedState);
// getAllChildStates(stringRep.split('|')[0], JSON.parse(stringRep.split('|')[1])) 
function getAllChildStatesWrapper(totalstate){
	getAllChildStates(totalstate.split('|')[0], JSON.parse(totalstate.split('|')[1]))
}
function getAllChildStates(gamestate, extendedState){
	
	var allPossibleMoves = []
	
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
			var letterCoord =  (x % 9) + 1 ;
			var numberCoord =  (8 -  Math.floor(x / 9));
			var currentPieceCoords = String.fromCharCode(letterCoord + 96) + numberCoord;
			
			let legalMoves = getLegalMoves(currentPieceCoords);
			
			for (const move of Object.keys(legalMoves)) {
				
				allPossibleMoves = allPossibleMoves.concat( legalMoves[move].gamestate + "|" + JSON.stringify(legalMoves[move].extendedState));
				// TODO, case of promotion!
			}
		}
	}
	return allPossibleMoves;
}

function calculateMaterialScoreWrapper(totalstate){
	var posGamestate  = totalstate.split('|')[0];
	var posExtendedState = JSON.parse(totalstate.split('|')[1]);
	return calculateMaterialScore(posGamestate, posExtendedState);
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
				if(extendedState.isWhitesTurn){ return -10000;
				}else{ 							return +10000; }
			}else{
				// stalemate score is zero. This is a cludge to get the return code 
				return 6969; 
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
