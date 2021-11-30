var gamestate = "________;________;________;________;________;________;________;________;";
var extendedState = {
	"isWhitesTurn": true,
	// represent allowed castling options:
	"a1": true,
	"h1": true,
	"a8": true,
	"h8": true,
	"EnpassanablePawn": false,
	"StateRepetitionCounter": {}
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

getAllChildStates(gamestate, extendedState){
	var allPossibleMoves = []
	
	var referenceState;
	if(extendedState.isWhitesTurn){
		referenceState = gamestate.toLowerCase();
	}else{
		referenceState = gamestate.toUpperCase();
	}
	
	for (let x = 0; x < 72 ; x++) {
		if(referenceState[x] === '_' | referenceState[x] === ';'  ){continue;}
		if(referenceState[x] === state[x]){
			// indicates is allied piece.
			// TODO: calculate coords
			
			var letterCoord =  (x % 9) + 1 ;
			var numberCoord =  (8 -  Math.floor(x / 9));
			var currentPieceCoords = String.fromCharCode(letterCoord + 96) + numberCoord;
			
			[].push.apply(allPossibleMoves, getLegalMoves(currentPieceCoords)));

		}
	}
}


// Best move is the one which results in the gamestate with the highest score.
// Best(state) = max( {children(state)} )

// Score(state) = 


