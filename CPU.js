var maxDepth = 4;
function calculateBestMove(gamestate){

	// Salvage subtree of states down the path we are going. - 
	// This introduces a bug where it cant converge to checkmate state because cant find fastest path/gets stuck in a loop
	
	//console.log("# States from end of last go: " + Object.keys(AllAnalysedStatesClone).length);
	//var currentStateAnal = getAnalysedStates(gamestate);
	//if(currentStateAnal){ 
	//	cloneAnalysedSubTree(currentStateAnal, maxDepth);
	//}
	//AllAnalysedStates = AllAnalysedStatesClone;
	//AllAnalysedStatesClone = {};
	AllAnalysedStates = {};
	console.log("# States salvaged: " + Object.keys(AllAnalysedStates).length);
	
	// Now calculate best move.
	var bestMoveAndScore = bestMoveToDepth(gamestate, maxDepth);
	
	console.log("# States analysed: " + Object.keys(AllAnalysedStates).length);
	console.log("Score Estimate: " + bestMoveAndScore.bestScore);
	
	return bestMoveAndScore.bestState;
}
String.prototype.isWhitesTurn = function isItWhitesTurn() {
	 return (this[73] === '1');
};


// Hashtable of lists of analysed States
var AllAnalysedStates = {};
var AllAnalysedStatesClone = {};


// The score(state, depth) is defined as the best move of the children to depth - 1
// returns {bestState: bestState, bestScore: bestScore}
function bestMoveToDepth(startingState, depth){

	// See if state has already been analsed. If not, create the state in AllAnalysedStates
	var analysedStartingState = createOrGetAnalysedState(startingState);
	var isWhitesTurn = startingState.isWhitesTurn();
	
	// If the state has been analysed to sufficient depth, just return the already calculated best move.
	if(analysedStartingState.Depth >= depth){
		
		// (Also catches check and stalemates, since their depth is set to inf).
		return {bestState: analysedStartingState.BestChild, bestScore: analysedStartingState.Score};
	}
	
	// If ChildStates have already been calculated, use them. Otherwise calculate the childstates
	if(! analysedStartingState.ChildStates) { 
		analysedStartingState.ChildStates = calculateChildStates(startingState);

		// If there are no legal playable moves - this state is actually a mate position.
		if(analysedStartingState.ChildStates.length === 0)
		{
			if( amIInCheck(startingState, startingState.isWhitesTurn()) )
			{
				// checkmate
				// var discoveredMateDepth = (maxDepth - depth); // read depth as 'current depth'
				if(isWhitesTurn){ 
					analysedStartingState.Score = -10000 - depth;
				}else{ 							
					analysedStartingState.Score = +10000 + depth;
				}				
			}else{
				// stalemate score is zero.
				analysedStartingState.Score = 0;
			}

			// Once in mate, always in mate. So this is known to infinite depth, and all childstates is just this state.
			analysedStartingState.Depth = 10000;
			analysedStartingState.BestChild = startingState;

			return {bestState: startingState, bestScore: bestScore};
		}
	}

	// TODO: This doesnt work for checkmates because of how the logic above works.
	// I think this is failing because if multiple paths lead to checkmate, there is no prioritisation for the fastest, and it will never actually reach it
	var bestState;
	var bestScore;

	for(var possState of analysedStartingState.ChildStates){
		var analysedPossState = createOrGetAnalysedState(possState);
		
		if(analysedPossState.Depth < depth){
			// we have not analysed this state to sufficient depth, so analyse with recursive call!
			bestMoveToDepth(possState, (depth - 1));
		}
		
		// We can now be sure that all child states have been analysed to sufficient depth. Now we simply min_max out of these child states.
		if(isWhitesTurn){ 
			// white wants to find highest score;
			if( (analysedPossState.Score > bestScore) || (bestScore == null) ){
				bestScore = analysedPossState.Score;
				bestState = analysedPossState.State;
			}
		}else{
			// black wants to find lowest score;
			if( (analysedPossState.Score < bestScore) || (bestScore == null) ){
				bestScore = analysedPossState.Score;
				bestState = analysedPossState.State;
			}
		}
	}
	analysedStartingState.Depth = depth;
	analysedStartingState.BestChild = bestState;
	analysedStartingState.Score = bestScore;
	return {bestState: bestState, bestScore: bestScore};
}

function getAnalysedStates(stateString){
	var hashCode = stateString;
	if(AllAnalysedStates[hashCode]){
		return AllAnalysedStates[hashCode];
	}

	return null; 
}

function createOrGetAnalysedState(stateString){

	var hashCode = stateString;
	if(AllAnalysedStates[hashCode]){		
		return AllAnalysedStates[hashCode];		
	}
	var baseScore = calculateMaterialScore(stateString);
	
	var AnalysedState = {
		Score: baseScore,
		Depth: 0,
		ChildStates: null, 
		BestChild: null,
		State: stateString
	}

	AllAnalysedStates[hashCode] = AnalysedState;
	
	return AnalysedState;
}

function cloneAnalysedSubTree(rootState, depthLimit){
	if(depthLimit < 0 ){ return null;} // prevents loops

	// ChildStates is a lazily evaluated field. The childStates may or may not be analysed!
	if(rootState.ChildStates){
		for(var childState of rootState.ChildStates){
			cloneAnalysedSubTree(createOrGetAnalysedState(childState), depthLimit - 1);
		}
	}
	
	// Now insert the root node.
	var hashCode = rootState.State; //.hashCode();
	if(AllAnalysedStatesClone[hashCode]){

		return;
	}
	AllAnalysedStatesClone[hashCode] = rootState;
}

// Returns the child states as a list.
function calculateChildStates(totalstate){
	
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
				
				// Concatenates the legal moves for this coordinate 
				allPossibleMoves = allPossibleMoves.concat( legalMoves[move] );
			
			}
		}
	}

	return allPossibleMoves;
}

function calculateMaterialScore(gamestate){
	
	let score = 0;

	for (let x = 0; x < 72 ; x++) {
		switch(gamestate[x]) {
			case '_':
			case ';':
				continue;
			case 'p':	score = score + (0.8 + (Math.floor((71-x)/9))/10  + 0.0 * [39,40,30,31].includes(x) ); // this encourages pawns to push and take centre
			break;
			case 'P':	score = score - (0.8 + (Math.floor(x/9))/10  + 0.0 * [39,40,30,31].includes(x) );
			break;
			case 'r':	score = score + 5;
			break;
			case 'R':	score = score - 5;
			break;
			case 'q':	score = score + 9;
			break;
			case 'Q':	score = score - 9;
			break;
			case 'b':	score = score + 3.1;
			break;
			case 'B':	score = score - 3.1;
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
