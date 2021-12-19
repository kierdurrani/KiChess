var maxDepth = 4;
var salvage = true;
var NextMove;
function calculateBestMove(gamestate){

	// Salvage subtree of states down the path we are going.
	if(salvage)	{
		if(getAnalysedState(gamestate)){
			cloneAnalysedSubTree( gamestate, maxDepth);
		}
	
		AllAnalysedStates = AllAnalysedStatesClone;
		console.log("# States salvaged: " + Object.keys(AllAnalysedStatesClone).length);
		AllAnalysedStatesClone = {};
	}else{
		AllAnalysedStates = {};
	}
	
	// Now calculate best move.
	var score = MinMax(gamestate, maxDepth, -1000000, 1000000);
	
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
function MinMax(startingState, depth, alpha, beta){

	// See if state has already been analsed. If not, create the state in AllAnalysedStates
	var analysedStartingState = createOrGetAnalysedState(startingState);
	
	// If the state has been analysed to sufficient depth, just return the raw score.
	if(depth <= 0){ return analysedStartingState.Score; }

	// Cache this
	var isWhitesTurn = startingState.isWhitesTurn();

	// Lazy Evaluation: If ChildStates have already been calculated, use it. Otherwise calculate the childstates
	if(! analysedStartingState.ChildStates) { 
		analysedStartingState.ChildStates = calculateChildStates(startingState);
	}

	// If there are no legal playable moves - this state is actually a mate position.
	if(analysedStartingState.ChildStates.length === 0)
	{
		if( amIInCheck(startingState, startingState.isWhitesTurn()) )
		{
			if(isWhitesTurn){ // checkmate
				analysedStartingState.Score = -10000;
			}else{ 
				analysedStartingState.Score = +10000;
			}				
		}else{
			// stalemate score is zero.
			analysedStartingState.Score = 0;
		}

		return analysedStartingState.Score;
	}

	var bestState;
	var bestScore;
	for(var possState of analysedStartingState.ChildStates)
	{

		// Alpha-Beta Pruning 
		// i.e. We do not need to consider other possStates if opponent should never play a move resulting in this startingState.
		if(bestScore)
		{
			if(isWhitesTurn){
				// white is trying to maximise.
				if(bestScore > beta){
					// Indicates that white can force a move worse than a move black could get by choosing another branch earlier on
					break;
				}
			}else{
				// blacks turn
				if(bestScore < alpha){
					// Indicates that black can force a move worse than a move white could get by choosing another branch earlier on. 
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
		// If top level, record best state
		NextMove = bestState;
	}

	// This encourages faster convergence to checkmates.
	if(bestScore > +1000){
		return (bestScore - 1);
	}
	if(bestScore < -1000){
		return (bestScore + 1);
	}
	return bestScore;
}

function getAnalysedState(stateString){

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

	var analysedState = getAnalysedState(rootState);

	// Insert this into the new tree if it isnt already there.
	if(AllAnalysedStatesClone[rootState]){
		return;
	}else{
		AllAnalysedStatesClone[rootState] = analysedState;
	}
	
	// Recurse on all childstates
	// ChildStates is a lazily evaluated field, so could be null..
	if(analysedState.ChildStates){
		for(var childState of analysedState.ChildStates){
			if(getAnalysedState(childState)){
				cloneAnalysedSubTree( childState, depthLimit - 1);
			}
		}
		if(analysedState.ChildStates.length === 0 ){
			AllAnalysedStatesClone[rootState] = null;
		}
	}
}

// Returns the childStates as a list.
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