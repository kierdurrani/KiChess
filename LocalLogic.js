var gamestate = "________;________;________;________;________;________;________;________;";
var extendedState = {
	"isWhitesTurn": true,
	// represent allowed castling options:
	"a1": true,
	"h1": true,
	"a8": true,
	"h8": true,
	"Enpassant": false
}
var gameMetaData = {
	"isWhiteCPU": false,
	"isBlackCPU": true,
	"lastMovedPieceFrom": null,
	"lastMovedPieceTo": null
}

function calculateBoardState(state, coord, piece){
	
	var colNumber = coord[0].charCodeAt(0) - 96; // Col is given by leading letter. Convert this to integer from 1-8
	var rowNumber = Number(coord[1]); 
	
	var position = 9 * (8 - rowNumber) + colNumber - 1;
		
	return( state.substring(0, position) + piece + state.substring(position + 1) );
}

function transCoords(coord, y, x){
	var newRank = coord[0].charCodeAt(0) - 96 + y; 
	var newCol  = Number(coord[1]) + x;

	if ( newCol < 1 ||  newCol > 8 ||  newRank < 1 || newRank > 8){
		return null; // off the board
	}else{
		 return(String.fromCharCode(newRank + 96) + newCol);
	}
}

function amIInCheck(board, isWhiteTeam)
{
	// Overview of logic: start from the king and see if the king is in vision by an enemy piece
	// team == true -> white 
	
	// Get coordinates of the king.
	var kingIndex = isWhiteTeam ? board.indexOf('k') : board.indexOf('K'); // position of king in string
	// console.log("index: " + kingIndex);
	
	var letterCoord =  (kingIndex % 9) + 1 ;
	var numberCoord =  (8 -  Math.floor(kingIndex / 9));
	var kingsCoords = String.fromCharCode(letterCoord + 96) + numberCoord;
	// console.log("I think the king is at: " + kingsCoords);

	function getPiece2(board, coordinate){

		var columnIndex = coordinate[0].charCodeAt(0) - 97; // Col is given by leading letter. This formula converts a char into its corresponding integer from 0-7
		var rowContents = board.split(";")[8 - coordinate[1]]; // Rows are enumerated 'backwards' in the gamestate to the coords.
		
		var cellContent = rowContents[columnIndex];      
		
		return cellContent;
	}

	// Return the coordinates of an ENEMY PIECE (if any), at the end of the line (x,y) diagonal from startingCoord
	function getVisibleEnemyPiece(board, startingCoord, x, y){

		var iter = 1;
		var newCoords = transCoords(startingCoord, x * iter, y * iter);
		while( newCoords ){
			if(getPiece2(board, newCoords) !== '_'){
			
				var visiblePiece = getPiece2(board, newCoords);
				
				var isWhitePiece = (visiblePiece === visiblePiece.toLowerCase());
				var isEnemyPiece = !(isWhitePiece === isWhiteTeam);
				
				if(isEnemyPiece){
					return {piece: visiblePiece, coords: newCoords};
				}else{
					return null;
				}
			}
			iter++;
			newCoords = transCoords(kingsCoords, x * iter, y * iter);
		}	
		return null;
	}
	
	// Evaluate Threats:
	
	// Threatened on diagonals:
	var allVisibleDiagonals = [getVisibleEnemyPiece(board, kingsCoords, +1, +1), getVisibleEnemyPiece(board, kingsCoords, +1, -1), 
							   getVisibleEnemyPiece(board, kingsCoords, -1, +1), getVisibleEnemyPiece(board, kingsCoords, -1, -1)];		
	for( var visibleEnemy of allVisibleDiagonals){
		if( !visibleEnemy ){ continue; } // Catch possible null value error here..
		if( ['b','B','q','Q'].includes(visibleEnemy.piece) ){ return visibleEnemy.coords }
	}
	
	// Threats vertically / horizontally
	var allVisibleDiagonals = [getVisibleEnemyPiece(board, kingsCoords, +1, 0), getVisibleEnemyPiece(board, kingsCoords, 0, -1), 
							   getVisibleEnemyPiece(board, kingsCoords, -1, 0), getVisibleEnemyPiece(board, kingsCoords, 0, +1)];		
	for( var visibleEnemy of allVisibleDiagonals){
		if( !visibleEnemy ){ continue; } // Catch possible null value error here..
		if( ['r','R','q','Q'].includes(visibleEnemy.piece) ){ return visibleEnemy.coords }
	}
	
	// Threats from Pawns:
	var directionOfThreateningPawn = (isWhiteTeam ? 1 : -1 );
	
	if(isWhiteTeam){
		if( transCoords(kingsCoords, +1,  +1) && getPiece2(board, transCoords(kingsCoords, +1,  +1)) === 'P'){ return transCoords(kingsCoords, +1,  +1)} ;
		if( transCoords(kingsCoords, -1,  +1) && getPiece2(board, transCoords(kingsCoords, -1,  +1)) === 'P'){ return transCoords(kingsCoords, -1,  +1)} ;
	}else{
		if( transCoords(kingsCoords, +1,  -1) && getPiece2(board, transCoords(kingsCoords, +1,  -1)) === 'p'){ return transCoords(kingsCoords, +1,  -1)} ;
		if( transCoords(kingsCoords, -1,  -1) && getPiece2(board, transCoords(kingsCoords, -1,  -1)) === 'p'){ return transCoords(kingsCoords, -1,  -1)} ;
	}

	
	// Threats from knights:
	var possibleKnightCoords = [transCoords(kingsCoords, +1,  +2), transCoords(kingsCoords, +1,  -2), 
								transCoords(kingsCoords, -1,  +2), transCoords(kingsCoords, -1,  -2), 
								transCoords(kingsCoords, +2,  +1), transCoords(kingsCoords, +2,  -1), 
								transCoords(kingsCoords, -2,  +1), transCoords(kingsCoords, -2,  -1)];		
	for( var possCoords of possibleKnightCoords){
		if( !possCoords ){ continue; } // Catch possible null value error here..
		
		 
		if(  isWhiteTeam   && (getPiece2(board, possCoords) === 'N') ){ return possCoords } 
		if( (!isWhiteTeam) && (getPiece2(board, possCoords) === 'n') ){ return possCoords } 

	}
	
	// Finally, threats from king!
	var allCoords = [transCoords(kingsCoords, +1, +1), transCoords(kingsCoords, +1, +0), transCoords(kingsCoords, +1, -1), transCoords(kingsCoords, +0, +1),	
					 transCoords(kingsCoords, +0, -1), transCoords(kingsCoords, -1, -1), transCoords(kingsCoords, -1, +0), transCoords(kingsCoords, -1, +1) ];

	for(var possCoords of allCoords)
	{ 
		if( !possCoords ){ continue; }
		if( (getPiece2(board, possCoords) === 'K') || (getPiece2(board, possCoords) === 'k') ){
			return possCoords;
		}
	}
	
	// else
	return false;
}

function getLegalMoves(coord){
		
	var piece = getPiece(coord);
	var CandidateLegalMoves = {};
	
	// Logic works as follows:
	// A hash table called CandidateLegalMoves with keys of the coordinate you click on to make the move is defined.
	// The hash table contains an object with properties: gamestate = string rep of the board
	// Assume that enpassanable will be no unless specified.
	// Example:
	// CandidateLegalMoves[newCoords] = {gamestate : calculateBoardState(calculateBoardState(gamestate, coord, '_'), newCoords, piece), extendedStateChange : {"Enpassant": 'h1'}, promotion: h8};
	
	// Auxillary functions:
	function isEnemyPiece(piece){
		if(piece === "_") {return false;}
		
		var isWhitePiece  = (piece == piece.toLowerCase());
		return !(isWhitePiece === extendedState.isWhitesTurn);
	}
	
	function getDefaultExtendedState(){
		var newExtendedState =  JSON.parse(JSON.stringify(extendedState));
		newExtendedState.Enpassant = null;
		newExtendedState.isWhitesTurn = ! extendedState.isWhitesTurn;
		return newExtendedState;
	}
	
	function findAllMovesInLine(x,y){
		var iter = 1;
		var newCoords = transCoords(coord, x * iter, y * iter);
		while( newCoords ){
			if(getPiece(newCoords) == '_'){
				var newBoardState =  calculateBoardState(calculateBoardState(gamestate, coord, '_'), newCoords, piece);
				var extendedStateCopy = getDefaultExtendedState();
				CandidateLegalMoves[newCoords] = { gamestate: newBoardState, extendedState: extendedStateCopy};
			}else{ 
				if(isEnemyPiece(getPiece(newCoords))){
					var newBoardState =  calculateBoardState(calculateBoardState(gamestate, coord, '_'), newCoords, piece);
					var extendedStateCopy = getDefaultExtendedState();
					CandidateLegalMoves[newCoords] = { gamestate: newBoardState, extendedState: extendedStateCopy};
					break; // If can capture, cant carry on after.
				}else{
					break; // Cannot take own piece
				}
			}
			iter++;
			newCoords = transCoords(coord,x * iter, y * iter);
		}
	}

	/////////////////////////////	MAIN LOGIC	///////////////////////////////////
	if( piece == 'R' || piece == 'r' ){  		
	
	findAllMovesInLine(0,1);
		findAllMovesInLine(1,0);
		findAllMovesInLine(0,-1);
		findAllMovesInLine(-1,0);
		
		// Disable castling after a rook moves.
		if( ['a1','a8','h1','h8'].includes(coord) ){ 
			// This indicates rook has moved from starting square (or is in some other rooks square, which doesnt matter)
			Object.keys(CandidateLegalMoves).forEach(function (movelocation) {
				
				CandidateLegalMoves[movelocation]['extendedState'][coord] = false;
				console.log(CandidateLegalMoves[movelocation]);
			})
		}
	}
	if( piece == 'N' || piece == 'n' ){  
		
		var allCoords = [transCoords(coord, 1, 2), transCoords(coord, 1, -2), transCoords(coord, -1, 2), transCoords(coord, -1, -2),	
						 transCoords(coord, 2, 1), transCoords(coord, 2, -1), transCoords(coord, -2, 1), transCoords(coord, -2, -1) ];
		
		for(var possCoords of allCoords){
			if( !possCoords ){ continue; } // Catch possible null value error here..
			if( (getPiece(possCoords) == '_') || isEnemyPiece(getPiece(possCoords)) ){
				let newBoardState = calculateBoardState(calculateBoardState(gamestate, coord, '_'), possCoords, piece);
				CandidateLegalMoves[possCoords] = { gamestate : newBoardState, extendedState: getDefaultExtendedState() };
			}		
		}
	} 	
	if( piece == 'B' || piece == 'b' ){  

		findAllMovesInLine(+1,+1);
		findAllMovesInLine(+1,-1);
		findAllMovesInLine(-1,+1);	
		findAllMovesInLine(-1,-1);
	}
	if( piece == 'K' || piece == 'k' ){  
		var allCoords = [transCoords(coord, 1, 1), transCoords(coord, 1, 0), transCoords(coord, 1, -1), transCoords(coord, 0, 1),	
					transCoords(coord, 0, -1), transCoords(coord, -1, -1), transCoords(coord, -1, 0), transCoords(coord, -1, 1) ];
			
		for(var possCoords of allCoords){
			// Possible null value error here..
			if( !possCoords ){ continue; }
			if( (getPiece(possCoords) == '_') || isEnemyPiece(getPiece(possCoords)) ){
				
				// Moving the king prevents castling
				var newExtendedState = getDefaultExtendedState();
				if( piece == 'k' ){  
					newExtendedState['a1'] = false;
					newExtendedState['a8'] = false;
				}
				if( piece == 'K'){
					newExtendedState['h1'] = false;
					newExtendedState['h8'] = false;
				}
				CandidateLegalMoves[possCoords] = { gamestate : calculateBoardState(calculateBoardState(gamestate, coord, '_'), possCoords, piece), extendedState: newExtendedState };
			}
		}
		
		// Castling:
		if( piece === 'k'){
			
			// White long (left) side castle.  king starts at E1, and moves to B1
			if(extendedState['a1']){
				if( (getPiece('b1')==='_') && (getPiece('c1')==='_') && (getPiece('d1')==='_') ){ 
					// king starts at E1, and moves to B1. Rook starts at A1 and finishes at B1
					// Verify not initially in check, and all intermediate squares are not threatened.
					if( ! amIInCheck(gamestate, extendedState.isWhitesTurn) ){
					
						var intState1 = calculateBoardState(calculateBoardState(gamestate, 'e1', '_'), 'd1', 'k');
						if( !amIInCheck(intState1, extendedState.isWhitesTurn) ){
							
							var intState2 = calculateBoardState(calculateBoardState(intState1, 'd1', '_'), 'c1', 'k');
							if( !amIInCheck(intState2, extendedState.isWhitesTurn) ){
								
								var intState3 = calculateBoardState(calculateBoardState(intState2, 'c1', '_'), 'b1', 'k'); // no need to check this state 
								var finalState = calculateBoardState(calculateBoardState(intState3, 'a1', '_'), 'c1', 'r'); // This gets checked later
								
								var newExtendedState = getDefaultExtendedState();
								newExtendedState['a1'] = false;
								newExtendedState['h1'] = false;
								
								CandidateLegalMoves['a1'] = { gamestate : finalState, extendedState: newExtendedState };
							}
						}
					}
				}
			}
			
			// White short (right) side castle. 
			if(extendedState['h1']){
				if( (getPiece('f1')==='_') && (getPiece('g1')==='_')  ){ 
					// king starts at e1, and moves to g1. Rook starts at h1 and finishes at f1
					// Verify not initially in check, and all intermediate squares are not threatened.
					if( ! amIInCheck(gamestate, extendedState.isWhitesTurn) ){
					
						var intState1 = calculateBoardState(calculateBoardState(gamestate, 'e1', '_'), 'f1', 'k');
						if( !amIInCheck(intState1, extendedState.isWhitesTurn) ){
							
							var intState2 = calculateBoardState(calculateBoardState(intState1, 'f1', '_'), 'g1', 'k'); // no need to check this state 
							var finalState = calculateBoardState(calculateBoardState(intState2, 'h1', '_'), 'f1', 'r'); // This gets checked later
							
							var newExtendedState = getDefaultExtendedState();
							newExtendedState['a1'] = false;
							newExtendedState['h1'] = false;
								
							CandidateLegalMoves['h1'] = { gamestate : finalState, extendedState: newExtendedState};
						}
					}
				}
			}
		}else{
			// black long (left) side castle.  king starts at e8, and moves to b8
			if(extendedState['a8']){
				if( (getPiece('b8')==='_') && (getPiece('c8')==='_') && (getPiece('d8')==='_') ){ 
					// king starts at E1, and moves to B1. Rook starts at A1 and finishes at B1
					// Verify not initially in check, and all intermediate squares are not threatened.
					if( ! amIInCheck(gamestate, extendedState.isWhitesTurn) ){
					
						var intState1 = calculateBoardState(calculateBoardState(gamestate, 'e8', '_'), 'd8', 'K');
						if( !amIInCheck(intState1, extendedState.isWhitesTurn) ){
							
							var intState2 = calculateBoardState(calculateBoardState(intState1, 'd8', '_'), 'c8', 'K');
							if( !amIInCheck(intState2, extendedState.isWhitesTurn) ){
								
								var intState3 = calculateBoardState(calculateBoardState(intState2, 'c8', '_'), 'b8', 'K'); // no need to check this state 
								var finalState = calculateBoardState(calculateBoardState(intState3, 'a8', '_'), 'c8', 'R'); // This gets checked later
								
								var newExtendedState = getDefaultExtendedState();
								newExtendedState['a8'] = false;
								newExtendedState['h8'] = false;
								CandidateLegalMoves['a8'] = { gamestate : finalState, extendedState: newExtendedState };
							}
						}
					}
				}
			}
			// black short (right) side castle. 
			if(extendedState['h8']){
				if( (getPiece('f8')==='_') && (getPiece('g8')==='_')  ){ 
					// king starts at e8, and moves to g8. Rook starts at h8 and finishes at f8
					// Verify not initially in check, and all intermediate squares are not threatened.
					if( ! amIInCheck(gamestate, extendedState.isWhitesTurn) ){
					
						var intState1 = calculateBoardState(calculateBoardState(gamestate, 'e8', '_'), 'f8', 'K');
						if( !amIInCheck(intState1, extendedState.isWhitesTurn) ){
							
							var intState2 = calculateBoardState(calculateBoardState(intState1, 'f8', '_'), 'g8', 'K'); // no need to check this state 
							var finalState = calculateBoardState(calculateBoardState(intState2, 'h8', '_'), 'f8', 'R'); // This gets checked later
							
							var newExtendedState = getDefaultExtendedState();
							newExtendedState['a8'] = false;
							newExtendedState['h8'] = false;
							CandidateLegalMoves['h8'] = { gamestate : finalState, extendedState: newExtendedState };
						}
					}
				}
			}
		}

		
	} 
	if( piece == 'Q' || piece == 'q' ){  
		findAllMovesInLine(+1,+1);
		findAllMovesInLine(+1,-1);
		findAllMovesInLine(-1,+1);	
		findAllMovesInLine(-1,-1);
		findAllMovesInLine(0,1);
		findAllMovesInLine(1,0);
		findAllMovesInLine(0,-1);
		findAllMovesInLine(-1,0);
	} 		
	if( piece === 'p' || piece === 'P' ){ 
		
		var direction = 1;
		if(piece === "P"){
			direction = -1;
		}
		
		var newCoords = transCoords(coord, 0, direction * 1);
		
		// Pawn can move forwards
		if( newCoords && getPiece(newCoords) === "_" ){
			
			var promotion = false
			if(newCoords.match('.8') || newCoords.match('.1')){ promotion = newCoords; }
			CandidateLegalMoves[newCoords] = { gamestate : calculateBoardState(calculateBoardState(gamestate, coord, '_'), newCoords, piece), extendedState: getDefaultExtendedState(), promotion: promotion };
			
			// Can move 2 spaces on first move:
			if((piece === 'p' && coord.match('.2')) || (piece === 'P' && coord.match('.7'))){
				newCoords = transCoords(coord, 0, direction * 2);
				if( newCoords && getPiece(newCoords) === "_" ){
					var newExtendedState = getDefaultExtendedState();
					newExtendedState['Enpassant'] = transCoords(coord, 0, direction * 1);
					CandidateLegalMoves[newCoords] = { gamestate : calculateBoardState(calculateBoardState(gamestate, coord, '_'), newCoords, piece), extendedState: newExtendedState};
				}	
			}
		}			
		
		// Pawn can take diagonally - and enpassant
		newCoords = transCoords(coord, 1, direction * 1);
		if(  newCoords && (isEnemyPiece(getPiece(newCoords)) || (newCoords === extendedState.Enpassant)) )
		{
			var promotion = false
			if(newCoords.match('.8') || newCoords.match('.1')){ promotion = newCoords; }
			CandidateLegalMoves[newCoords] = { gamestate : calculateBoardState(calculateBoardState(gamestate, coord, '_'), newCoords, piece), extendedState: getDefaultExtendedState(),  promotion: promotion };
			
			// In the event of en-passant, also need to remove the other pawn 
			if(newCoords === extendedState.Enpassant){
				var pawnToDeleteCoords =  transCoords(extendedState.Enpassant, 0, (-direction)*1 );
				CandidateLegalMoves[newCoords].gamestate = calculateBoardState(CandidateLegalMoves[newCoords].gamestate, pawnToDeleteCoords , '_');
			}
		}
		
		newCoords = transCoords(coord, -1, direction * 1);
		if(  newCoords && (isEnemyPiece(getPiece(newCoords)) || (newCoords === extendedState.Enpassant) ) )
		{
			var promotion = false
			if(newCoords.match('.8') || newCoords.match('.1')){ promotion = newCoords; }
			CandidateLegalMoves[newCoords] = { gamestate : calculateBoardState(calculateBoardState(gamestate, coord, '_'), newCoords, piece), extendedState: getDefaultExtendedState(), promotion: promotion };
			
			// In the event of en-passant, also need to remove the other pawn 
			if(newCoords === extendedState.Enpassant){
				var pawnToDeleteCoords =  transCoords(extendedState.Enpassant, 0, (-direction)*1 );
				CandidateLegalMoves[newCoords].gamestate = calculateBoardState(CandidateLegalMoves[newCoords].gamestate, pawnToDeleteCoords , '_');
			}
		}		
	 } 		 
	if( piece == '_'){
		previouslySelectedSquare = null;
		throw "This should not be possible - trying to move an empty square"
	}
	
	// Validate moves are not in checks
	for (const move of Object.keys(CandidateLegalMoves)){ 
		if(amIInCheck( CandidateLegalMoves[move].gamestate, extendedState.isWhitesTurn)){
			delete CandidateLegalMoves[move];
		}
	}
	
	return CandidateLegalMoves;
		
}

function markLegalMoves(coord){

	// Mark the newly selected square.
	var currentSquare = document.getElementById(coord);	
	currentSquare.innerHTML = '<img src="assets/SelectedSquare.png" class="overlay" >' +  currentSquare.innerHTML; // Show green selection
	
	var legalMoves = getLegalMoves(coord);
	for (const move of Object.keys(legalMoves)) {	
		var newSquare = document.getElementById(move);
		
		if(getPiece(move) !== "_")
		{
			newSquare.innerHTML += '<img src="assets/TakePiece.png" class="overlay" >'; 
		}else{
			newSquare.innerHTML += '<img src="assets/MovePiece.png" class="overlay" >'; 
			// TODO: special cases of castling and en-passant
		}	
	}	
}

function getPiece(coordinate){

	var columnIndex = coordinate[0].charCodeAt(0) - 97; // Col is given by leading letter. This formula converts a char into its corresponding integer from 0-7
	var rowContents = gamestate.split(";")[8 - coordinate[1]]; // Rows are enumerated 'backwards' in the gamestate to the coords.
	
	var cellContent = rowContents[columnIndex];      
	
	return cellContent;
}

var previouslySelectedSquare = null;
var promotionContext = false;
function selectSquare(coord){

	console.log("clicked on " + coord);
	if(promotionContext){
		// Close the pawn promotion window if player clicks off it.
		document.getElementById('chessboard').style.opacity = 1.0;
		document.getElementById('promotionOverlay').style.display = 'none';
		document.getElementById('promotionOverlayBlack').style.display = 'none';
		promotionContext = false;
		
		// TODO, have this work if you click off of the board all together.
	}
	
	
	if( gameMetaData.isWhiteCPU && (extendedState.isWhitesTurn)){ console.log("White to play. Waiting for CPU"); return;} 
	if( gameMetaData.isBlackCPU && !(extendedState.isWhitesTurn)){ console.log("Black to play. Waiting for CPU"); return;} 
	
	if(previouslySelectedSquare == null){
	
		var newSelectedPiece = getPiece(coord);
		if(newSelectedPiece == '_'){		
			console.log("Selected empty square, nothing to do");
			return;
		}
		if(extendedState.isWhitesTurn && (newSelectedPiece != newSelectedPiece.toLowerCase())){		
			console.log("// white tried to select their opponent's piece");
			return;
		}			
		if(! extendedState.isWhitesTurn && (newSelectedPiece != newSelectedPiece.toUpperCase())){		
			console.log("// black tried to select their opponent's piece");
			return;
		}
		
		markLegalMoves(coord);
		previouslySelectedSquare = coord;
		
	}else{
		
		// Given that you have a currently selected piece:
			// if you clicked on another square and that is a legal move, then perform the move.
			// else, select the new piece
		
		// Clear previous overlay
		const elements = document.getElementsByClassName("overlay");
		while (elements.length > 0) elements[0].remove();
		
		// Validate the move is in the set of legal moves
		var legalMoves = getLegalMoves(previouslySelectedSquare);
		
		if(legalMoves[coord]){
			
			if(legalMoves[coord].promotion){
				
				promotionContext = previouslySelectedSquare + ';' + coord;
				document.getElementById('chessboard').style.opacity = 0.3;
				
				// Show pawn promotion window
				if(extendedState.isWhitesTurn){
					document.getElementById('promotionOverlay').style.display = 'block';
				}else{
					document.getElementById('promotionOverlayBlack').style.display = 'block';
				}
				return;
			}
			
			// Update gamestate and gameextended state.
			gamestate = legalMoves[coord].gamestate;
			
			//extendedState['Enpassant'] = false;
			//for (const property in legalMoves[coord].extendedStateChange) {
			//	
			//	// iterate over all properties $key of the object
			//	console.log("setting property " + property + " to value: " +  legalMoves[coord].extendedStateChange[property])
			//	extendedState[property] = legalMoves[coord].extendedStateChange[property];
			//}
			
			extendedState = legalMoves[coord].extendedState;
			renderBoard(gamestate);
			
			// Update turn 
			turnTransition();
			previouslySelectedSquare = null;
			
			
		}else{
			// Given they had a previously selected piece, they have not selcted a legal move for that peice.
			// Instead, just show the legal moves for that piece (via recursive call) 
			// TODO: if you click the same square, deselect it.
			
			previouslySelectedSquare = null;
			selectSquare(coord);
		}
	}
}

function startGame(){
	// Caps is black, lower case for white pieces. N = knight, K = king.
	var startingState = "RNBQKBNR;PPPPPPPP;________;________;________;________;pppppppp;rnbqkbnr;"
	extendedState =  {
		"isWhitesTurn": true,
		// represent allowed castling options:
		"a1": true,
		"h1": true,
		"a8": true,
		"h8": true,
		"Enpassant": false
	}
	gamestate = startingState;
	renderBoard(startingState);

}

function renderBoard(state){

	var rows = state.split(';');
	var chessBoard = document.getElementsByClassName("square");
	
	var x = 0;
	for (const row of rows) {		
		for( const cell of row.split('')){
				
			if( cell == 'R' ){ chessBoard[x].innerHTML = '<img src="assets/blackPieces/rook.png" height = 100px width = 100px >' } 
			if( cell == 'N' ){ chessBoard[x].innerHTML = '<img src="assets/blackPieces/knight.png" height = 100px width = 100px >' } 
			if( cell == 'B' ){ chessBoard[x].innerHTML = '<img src="assets/blackPieces/bishop.png" height = 100px width = 100px >' } 
			if( cell == 'K' ){ chessBoard[x].innerHTML = '<img src="assets/blackPieces/king.png" height = 100px width = 100px >' } 
			if( cell == 'Q' ){ chessBoard[x].innerHTML = '<img src="assets/blackPieces/queen.png" height = 100px width = 100px >' } 
			if( cell == 'P' ){ chessBoard[x].innerHTML = '<img src="assets/blackPieces/pawn.png" height = 100px width = 100px >' } 
			
			if( cell == 'r' ){ chessBoard[x].innerHTML = '<img src="assets/whitePieces/rook.png" height = 100px width = 100px >' } 
			if( cell == 'n' ){ chessBoard[x].innerHTML = '<img src="assets/whitePieces/knight.png" height = 100px width = 100px >' } 
			if( cell == 'b' ){ chessBoard[x].innerHTML = '<img src="assets/whitePieces/bishop.png" height = 100px width = 100px >' } 
			if( cell == 'k' ){ chessBoard[x].innerHTML = '<img src="assets/whitePieces/king.png" height = 100px width = 100px >' } 
			if( cell == 'q' ){ chessBoard[x].innerHTML = '<img src="assets/whitePieces/queen.png" height = 100px width = 100px >' } 
			if( cell == 'p' ){ chessBoard[x].innerHTML = '<img src="assets/whitePieces/pawn.png" height = 100px width = 100px >' } 
			
			if( cell == '_' ){ chessBoard[x].innerHTML = '' } 
		
			x++
		}
	}
	
	var isInCheck = amIInCheck(state, !extendedState.isWhitesTurn);
	if(isInCheck){
		// Get Location of the King:
		var kingIndex = (!extendedState.isWhitesTurn) ? gamestate.indexOf('k') : gamestate.indexOf('K'); 
		var letterCoord =  (kingIndex % 9) + 1 ;
		var numberCoord =  (8 -  Math.floor(kingIndex / 9));
		var kingsCoords = String.fromCharCode(letterCoord + 96) + numberCoord;
		
		var checkSquare =  document.getElementById(kingsCoords);
		checkSquare.innerHTML = '<img src="assets/Check.png"height = 97px width = 97px, style = "opacity: 1"  >' +  checkSquare.innerHTML ;
		
		// var checkSquare2 =  document.getElementById(isInCheck);
		// checkSquare2.innerHTML = '<img src="assets/Check.png"height = 97px width = 97px  >' +  checkSquare2.innerHTML ;
	}
}
function existsLegalMoves(gamestate, extendedState){
	
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
			// TODO: calculate coords.
			
			var letterCoord =  (x % 9) + 1 ;
			var numberCoord =  (8 -  Math.floor(x / 9));
			var currentPieceCoords = String.fromCharCode(letterCoord + 96) + numberCoord;
			
			if(Object.keys(getLegalMoves(currentPieceCoords)).length > 0){
				return true; // some legal move exists - not in stale/check-mate
			}
		}
	}
	return false;
}

function turnTransition(){
	// extendedState.isWhitesTurn = !(extendedState.isWhitesTurn);
	
	// Check if in stalemate / checkmate
	// Use this to get next possible moves from this state. First get all allied piece (this is for speed)

	
	// Handle stalemate / checkmate 
	var legalMoves = existsLegalMoves(gamestate, extendedState);
	if(!legalMoves){
		console.log('no moves found');
		if(amIInCheck(gamestate, extendedState.isWhitesTurn)){
			checkmate(extendedState.isWhitesTurn);
			return;
		}else{
			stalemate;
			return;
		}
	}
	
	
	// CPU move
	if( gameMetaData.isWhiteCPU &&  (extendedState.isWhitesTurn)){ makeMove(); turnTransition();} 
	if( gameMetaData.isBlackCPU && !(extendedState.isWhitesTurn)){ makeMove(); turnTransition();} 
	
	return
	
	// END TODO 
}
function checkmate(loosingTeamIsWhite){
	if(loosingTeamIsWhite){
		console.log('Black won!');
	}else{
		console.log('White won!');
	}
	
}
function stalemate(){
	Console.log("stalemate!")
}
function promotePawn(newPiece){
	
	document.getElementById('chessboard').style.opacity = 1.0;
	document.getElementById('promotionOverlay').style.display = 'none';
	document.getElementById('promotionOverlayBlack').style.display = 'none';
	
	// Process Move
	var previousPawnSquare = promotionContext.split(";")[0];
	var newSquare = promotionContext.split(";")[1];
	
	console.log(previousPawnSquare);
	gamestate = calculateBoardState(gamestate, newSquare, newPiece);
	gamestate = calculateBoardState(gamestate, previousPawnSquare, "_");
	
	renderBoard(gamestate);
	extendedState.isWhitesTurn = !(extendedState.isWhitesTurn);
	turnTransition();
	 
	previouslySelectedSquare = null;
	promotionContext = false;
}
