function makeMove2(){
	// Selects Random Legal Move
	var possStates = getAllChildStates(gamestate, extendedState);
	var randomMove = possStates[ Math.floor(Math.random() * (possStates.length - 1))];
	
	console.log("makeMove");
	console.log(randomMove);
	gamestate = randomMove.split('|')[0];
	extendedState =  JSON.parse(randomMove.split('|')[1]);
	renderBoard(gamestate);
}

function makeMove(){
	// Greedy best score next move;
	console.log("first order makeMove");
	var possStates = getAllChildStates(gamestate, extendedState);
	
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
