var maxDepth = 4;
var NextMove;
function calculateBestMove(gamestate){

	// Salvage subtree of states down the path we are going. - 
	// This introduces a bug where it cant converge to checkmate state because cant find fastest path/gets stuck in a loop
	
	console.log("# States from end of last go: " + Object.keys(AllAnalysedStates).length);
	var currentStateAnal = getAnalysedStates(gamestate);
	if(currentStateAnal){ 
		cloneAnalysedSubTree(currentStateAnal, maxDepth);
	}

	AllAnalysedStates = AllAnalysedStatesClone;
	AllAnalysedStatesClone = {};
	console.log("# States salvaged: " + Object.keys(AllAnalysedStates).length);

	// Now calculate best move.
	var score = MinMax(gamestate, maxDepth, -1000000, 1000000);
	analystedstate = getAnalysedStates(gamestate);

	console.log("# States analysed: " + Object.keys(AllAnalysedStates).length);
	console.log("Score Estimate: " + score);
	console.log("Cache Hits: " + cacheHits);
	cacheHits = 0;

	return NextMove;
}
String.prototype.isWhitesTurn = function isItWhitesTurn() {
	 return (this[73] === '1');
};


// Hashtable of lists of analysed States
var AllAnalysedStates = {};
var AllAnalysedStatesClone = {};

// Stores information about the state in the AllAnalysedStatesClone in the format: {Score: 0, Depth: 0, ChildStates: [], BestChild: '', State: ''}
function MinMax(startingState, depth, whitesWorstForceableScore, blacksWorstForceableScore){

	// See if state has already been analsed. If not, create the state in AllAnalysedStates
	var analysedStartingState = createOrGetAnalysedState(startingState);
	
	// If the state has been analysed to sufficient depth, just return - the score/best mvoe will be in AllAnalysedStates.
	if(depth <= 0){
		return analysedStartingState.Score;
	}

	// Cache this
	var isWhitesTurn = startingState.isWhitesTurn();

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
			return analysedStartingState.Score;
		}
	}

	var bestState;
	var bestScore;
	var alpha = whitesWorstForceableScore; // This is the score white can get at least as good as
	var beta = blacksWorstForceableScore;  //
	for(var possState of analysedStartingState.ChildStates){
		
		// Alpha-Beta Pruning 
		// may not need to consider any other possStates if opponent should never play this state.
		if(bestScore)
		{
			if(isWhitesTurn){
				// white is trying to maximise.
				if(bestScore > beta){
					break;
				}
			}else{
				// blacks turn
				if(bestScore < alpha){
					// blacks turn. and if we reach this situation, 
					// black could force a move worse than a move white could get down another branch. 
					break;
				}
			}
		}

		var possScore =	MinMax(possState, depth - 1, alpha, beta);
				
		// We can now be sure that all child states have been analysed to sufficient depth. Now we simply min_max out of these child states.
		if(isWhitesTurn){ 
			// white wants to find highest score;
			if( (possScore > bestScore) || (bestScore == null) ){
				bestScore = possScore;
				bestState = possState;
				if(bestScore > alpha){ alpha = bestScore } 
			}
		}else{
			// black wants to find lowest score;
			if( (possScore < bestScore) || (bestScore == null) ){
				bestScore = possScore;
				bestState = possState;
				if(bestScore < beta){ beta = bestScore } 
			}
		}
	}
	
	if(depth === maxDepth){
		console.log("If top level, maximise state");
		console.log(bestState);
		NextMove = bestState;
	}
	return bestScore;
}

function getAnalysedStates(stateString){

	if(AllAnalysedStates[stateString]){
		return AllAnalysedStates[stateString];
	}

	return null; 
}
var cacheHits = 0;
function createOrGetAnalysedState(stateString){

	if(AllAnalysedStates[stateString]){	
		cacheHits++;	
		return AllAnalysedStates[stateString];		
	}

	var AnalysedState = {
		Score: calculateMaterialScore(stateString),
		ChildStates: null
	}

	AllAnalysedStates[stateString] = AnalysedState;
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
	if(AllAnalysedStatesClone[rootState]){
		return;
	}else{
		AllAnalysedStatesClone[rootState] = rootState;
	}
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
		if(referenceState[x] === '_' || referenceState[x] === ';'  ){continue;}
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