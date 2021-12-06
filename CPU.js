var maxDepth = 4;
function calculateBestMove(gamestate){

	// Salvage subtree of states down the path we are going.
	console.log("# States from end of last go: " + Object.keys(AllAnalysedStatesClone).length);
	var currentStateAnal = getAnalysedStates(gamestate);
	if(currentStateAnal){
		cloneAnalysedSubTree(currentStateAnal, maxDepth);
	}
	
	AllAnalysedStates = AllAnalysedStatesClone;
	AllAnalysedStatesClone = {};
	console.log("# States salvaged: " + Object.keys(AllAnalysedStates).length);
	
	var bestMoveAndScore = bestMoveToDepth(gamestate, maxDepth);
	
	console.log("# States analysed: " + Object.keys(AllAnalysedStates).length);
	console.log("Score Estimate: " + bestMoveAndScore.bestScore);
	
	return bestMoveAndScore.bestState;
}
String.prototype.isWhitesTurn = function hash() {
	 return (this[73] === '1');
};

// Hashtable of lists of analysed States
var AllAnalysedStates = {};
var AllAnalysedStatesClone = {};

// best move is the one with the best score.
// the score(state, depth) is defined as the best move of the children to depth - 1
// returns {bestState: bestState, bestScore: bestScore}
var global;
function bestMoveToDepth(startingState, depth){

	// See if state has already been analsed. If not, create the state in AllAnalysedStates
	var analysedStartingState = createOrGetAnalysedState(startingState);
	
	if(analysedStartingState.Depth >= depth){
		// This state has already been analysed to sufficient depth. So just return the already calculated best move.
		// (Also catches check and stalemates, since their depth is set to inf).
		return {bestState: analysedStartingState.BestChildState, bestScore: analysedStartingState.DeepScore};
	}
	
	global = analysedStartingState;
	// If ChildStates have already been calculated, use that, otherwise calculate it.
	if(! analysedStartingState.ChildStates) { analysedStartingState.ChildStates = getAllChildStates(startingState); }
	
	var bestState;
	var bestScore;
	for(var possState of analysedStartingState.ChildStates){
		var analysedPossState = createOrGetAnalysedState(possState);
		
		if(analysedPossState.Depth < depth){
			// we have not analysed this state to sufficient depth, so analyse with recursive call!
			var moveAndScore = bestMoveToDepth(possState, (depth - 1));
			analysedPossState.DeepScore = moveAndScore.bestScore;
			analysedPossState.BestChildState = moveAndScore.bestState;
		}
		
		// Now we can be sure that we have already analysed this state to sufficient depth. Now we simply min_max
		if(analysedPossState.StateString.isWhitesTurn()){ // this is a quick and dirty equivalent to - if(extendedState.isWhitesTurn)
			// white wants to find highest score;
			if( (analysedPossState.DeepScore < bestScore) || (bestScore == null) ){
				bestScore = analysedPossState.DeepScore;
				bestState = analysedPossState.StateString;
			}
		}else{
			// black wants to find lowest score;
			if( (analysedPossState.DeepScore > bestScore) || (bestScore == null) ){
				bestScore = analysedPossState.DeepScore;
				bestState = analysedPossState.StateString;
			}
		}
	}
	analysedStartingState.Depth = depth;
	analysedStartingState.BestChildState = bestState;
	analysedStartingState.DeepScore = bestScore;
	return {bestState: bestState, bestScore: bestScore};
}

function getAnalysedStates(stateString){
	var hashCode = stateString;
	if(AllAnalysedStates[hashCode]){
		return AllAnalysedStates[hashCode];
	}
	// AnalysedState does not exist in the list of AllAnalysedStates:
	return null; 
}

function createOrGetAnalysedState(stateString){
//	console.log(stateString);
	var hashCode = stateString;
	if(AllAnalysedStates[hashCode]){		
		return AllAnalysedStates[hashCode];		
	}
	var baseScore = calculateMaterialScore(stateString);
	
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
		AnalysedState.ChildStates = [stateString]; // Cant remember why this works. Probably prevents trying to find non existent child states.
	}
	AllAnalysedStates[hashCode] = AnalysedState;
	
	return AnalysedState;
}

function cloneAnalysedSubTree(rootState, depthLimit){
	if(depthLimit < 0 ){ return null;} // prevents loops

	//ChildStates is a lazily evaluated field. The childStates may or may not be analysed!
	if(rootState.ChildStates){
		for(var childState of rootState.ChildStates){
			cloneAnalysedSubTree(createOrGetAnalysedState(childState), depthLimit - 1);
		}
	}
	
	// Now insert the root node.
	var hashCode = rootState.StateString; //.hashCode();
	if(AllAnalysedStatesClone[hashCode]){

		return;
	}
	AllAnalysedStatesClone[hashCode] = rootState;
}

// Returns all states as a list in format:
function getAllChildStates(totalstate){
	
	var allPossibleMoves = [];
	
	var referenceState;
	if(totalstate.isWhitesTurn()){
		referenceState = totalstate.toLowerCase();
	}else{
		referenceState = totalstate.toUpperCase();
	}
	
	for (let x = 0; x < 72 ; x++) {
		if(referenceState[x] === '_' | referenceState[x] === ';'  ){continue;}
		if(referenceState[x] === totalstate[x]){
			// indicates is allied piece.
			var letterCoord =  (x % 9) + 1 ;
			var numberCoord =  (8 -  Math.floor(x / 9));
			var currentPieceCoords = String.fromCharCode(letterCoord + 96) + numberCoord;
			
			let legalMoves = getLegalMoves(currentPieceCoords, totalstate);
			
			for (const move of Object.keys(legalMoves)) {
				// concatenates the legal moves for this coordinate 
				allPossibleMoves = allPossibleMoves.concat( legalMoves[move] );
				// TODO, handle case of promotion!
			}
		}
	}
	return allPossibleMoves;
}

function calculateMaterialScore(gamestate){
	
	let score = 0;
	// TODO, make faster so that extendedState is not necessary.
	// console.log(gamestate);
	// Determine whether in checkmate or in stalemate!
	var whitesTurn = gamestate.isWhitesTurn();
	if(!existsLegalMoves(gamestate, whitesTurn)){
		if(amIInCheck(gamestate, whitesTurn)){
		
			// checkmate
			if(whitesTurn){ 
				return -10000;
			}else{ 							
				return +10000; 
			}				
		}else{
			// stalemate score is zero. This is a cludge to get the return code 
			return 6969; 
		}
	}
	
	for (let x = 0; x < 72 ; x++) {
		switch(gamestate[x]) {
			case '_':
			case ';':
				continue;
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
