var gamestate = "________;________;________;________;________;________;________;________;|11111__"; // Section after '|' Encodes turn, castling rights (a1,h1,a8,h8) and enpassanable pawn
String.prototype.isWhitesTurn = function isItWhitesTurn() {
	return (this[73] === '1');
};
  
var gameMetaData = {
	"isWhiteCPU": false,
	"isBlackCPU": true
}

function calculateBoardState(state, coord, newPiece){
	// Modifies the board state 

	// Rows are enumerated 'backwards' and are 9 chars long due to colon seperator.
	// Cols are determined by the leading letter. This formula converts a char into its corresponding integer from 0-7
	var index = 9 * (8 - Number(coord[1])) + coord.charCodeAt(0) - 97;
		
	return( state.substring(0, index) + newPiece + state.substring(index + 1) );
}
function calculateBoardState2(state, coord1, newPiece1, coord2, newPiece2){
	// Modifies the board state, twice 
	var index1 = 9 * (8 - Number(coord1[1])) + coord1.charCodeAt(0) - 97;
	var index2 = 9 * (8 - Number(coord2[1])) + coord2.charCodeAt(0) - 97;
	
	if(index1 < index2){
		return( state.substring(0, index1) + newPiece1 + state.substring(index1 + 1, index2) + newPiece2 + state.substring(index2 + 1));
	}else{
		return( state.substring(0, index2) + newPiece2 + state.substring(index2 + 1, index1) + newPiece1 + state.substring(index1 + 1));
	}

}

function transCoords(coord, y, x){
	var newRank = coord.charCodeAt(0) - 96 + y; 
	var newCol  = Number(coord[1]) + x;

	if ( newCol < 1 ||  newCol > 8 ||  newRank < 1 || newRank > 8){
		return null; // off the board
	}else{
		 return(String.fromCharCode(newRank + 96) + newCol);
	}
}

function getGameState(){ return gamestate;}

function amIInCheck(board, isWhiteTeam)
{
	
	// Overview of logic: start from the king and see if the king is in vision by an enemy piece
	// team == true -> white 

	// Get coordinates of the king.
	var kingIndex = isWhiteTeam ? board.indexOf('k') : board.indexOf('K'); // position of king in string
	var kingX =  (kingIndex % 9) + 1 ;
	var kingY =  (8 -  Math.floor(kingIndex / 9));

    function getPieceRelativeToKing(dy, dx){

        var newY = kingY + dy; 
		if ( newY < 1 ||  newY > 8 ){ return null;}
        
		var newX = kingX + dx;
		if ( newX < 1 ||  newX > 8 ){ return null;}
    
        return board[9 * (8 - newY) + (newX - 1)]; 
        
    }

	// Return the coordinates of an ENEMY PIECE (if any), at the end of the line (x,y) diagonal from startingCoord
	function getVisibleEnemyToKing(x, y){
		
		var iter = 1;
		
        var newX = kingX + x;
        var newY = kingY + y;
		
        while( newX <= 8 && newY <= 8 && newX >= 1 && newY >= 1 ){
            // Rows are enumerated 'backwards' and are 9 chars long due to colon seperator.
			var visiblePiece = board[9 * (8 - newY) + (newX - 1)]; 

			if(visiblePiece !== '_'){
					
				var isWhitePiece =  (visiblePiece === visiblePiece.toLowerCase());
				var isEnemyPiece = !(isWhitePiece === isWhiteTeam);
				
				if(isEnemyPiece){
					return visiblePiece;
				}else{
					return null;
				}
			}
			iter++;
            var newX = kingX + iter * x;
            var newY = kingY + iter * y;    
		}	
		return null;
	}
	
	// Evaluate Threats:
	
	// Threatened on diagonals (bishops/queens)
	var allVisibleDiagonals = [getVisibleEnemyToKing( +1, +1), getVisibleEnemyToKing( +1, -1), 
							   getVisibleEnemyToKing( -1, +1), getVisibleEnemyToKing( -1, -1)];		
	
    for( let visibleEnemy of allVisibleDiagonals){
		if( !visibleEnemy ){ continue; } // Catch possible null value error here..
		if( ['b','B','q','Q'].includes(visibleEnemy) ){ return true; }
	}
	
	// Threats vertically / horizontally (rooks/queens)
	var allVisibleVerticals = [getVisibleEnemyToKing( +1, 0), getVisibleEnemyToKing( 0, -1), 
							   getVisibleEnemyToKing( -1, 0), getVisibleEnemyToKing( 0, +1)];	
                               
	for( let visibleEnemy of allVisibleVerticals){
		if( !visibleEnemy ){ continue; } // Catch possible null value error here..
		if( ['r','R','q','Q'].includes(visibleEnemy) ){ return true; }
	}
	
	// Threats from Pawns:
	if(isWhiteTeam){
		if( getPieceRelativeToKing( +1, +1) === 'P'){ return true; }
		if( getPieceRelativeToKing( +1, -1) === 'P'){ return true; }
	}else{
		if( getPieceRelativeToKing( -1, +1) === 'p'){ return true; }
		if( getPieceRelativeToKing( -1, -1) === 'p'){ return true; }
	}

	// Threats from knights:
	var possibleKnightCoords = [getPieceRelativeToKing( +1,  +2), getPieceRelativeToKing( +1,  -2), 
								getPieceRelativeToKing( -1,  +2), getPieceRelativeToKing( -1,  -2), 
								getPieceRelativeToKing( +2,  +1), getPieceRelativeToKing( +2,  -1), 
								getPieceRelativeToKing( -2,  +1), getPieceRelativeToKing( -2,  -1)];		
	
    var EnemyKnight = isWhiteTeam ? 'N' : 'n';
    for( let possibleEnemyKnight of possibleKnightCoords){				 
		if(  possibleEnemyKnight === EnemyKnight ){ return true; } 
	}
	
	// Finally, threats from king!
	var possibleEnemyKings = [getPieceRelativeToKing( +1, +1), getPieceRelativeToKing( +1, +0), getPieceRelativeToKing( +1, -1), getPieceRelativeToKing( +0, +1),	
					 		getPieceRelativeToKing( +0, -1), getPieceRelativeToKing( -1, -1), getPieceRelativeToKing( -1, +0), getPieceRelativeToKing( -1, +1) ];

    var EnemyKing = isWhiteTeam ? 'K' : 'k';
    for( let possibleEnemyKing of possibleEnemyKings){				 
        if(  possibleEnemyKing === EnemyKing ){ return true; } 
    }
	
	// else
	return false;
}

function getLegalMoves(coord, gamestate){

	var isItWhitesTurn = gamestate.isWhitesTurn(); // cache this for speed

	var piece = getPiece2(gamestate, coord);
	var CandidateLegalMoves = {};
	
	// Logic works as follows:
	// A hash table called CandidateLegalMoves with keys of the coordinate you click on to make the move is defined.
	// The values are the totalstate of the game after the move has been processed.

	// Auxillary functions:
	function isEnemyPiece(piece){
		if(piece === "_") {return false;}
		
		var isWhitePiece  = (piece == piece.toLowerCase());
		return !(isWhitePiece === isItWhitesTurn);
	}
	
	const defaultExtendedState = ((isItWhitesTurn ? '0' : '1') + gamestate.substring(74, 78) + '__');
		

	function findAllMovesInLine(dx, dy, extendedState){
		
		var iter = 1;
		var newX = startX + dx;
		var newY = startY + dy;
		
		// Removes the piece from its starting square - (since this )
		const DefaultNextState = calculateBoardState(gamestate.substring(0, 72) + '|' + extendedState, coord, '_'); 

		while( newX <= 8 && newY <= 8 && newX >= 1 && newY >= 1 )
		{
			// Rows are enumerated 'backwards' and are 9 chars long due to colon seperator.
			// Cols are determined by the leading letter. This formula converts a char into its corresponding integer from 0-7

			var index = 9 * (8 - newY) + newX - 1;

			var pieceOnSquare = gamestate[index];

			if(  pieceOnSquare == '_'){
				// The piece is moving to an empty square

				var ToCoords = String.fromCharCode(newX + 96) + newY;
				CandidateLegalMoves[ToCoords] = DefaultNextState.substring(0, index) + piece + DefaultNextState.substring(index + 1);
			}else{ 
				if(isEnemyPiece(pieceOnSquare)){

					// Represents the piece taking the enemy piece
					var ToCoords = String.fromCharCode(newX + 96) + newY;
					CandidateLegalMoves[ToCoords] = DefaultNextState.substring(0, index) + piece + DefaultNextState.substring(index + 1);
					break; 
				}else{
					// Cannot capture allied piece, or jump over it.
					break; 
				}
			}
			iter++;
			var newX = startX + iter * dx;
			var newY = startY + iter * dy;
		}
	}

	/////////////////////////////	MAIN LOGIC	///////////////////////////////////
	
	switch(piece)
	{
		case 'p':
		case 'P':
				// Represents the direction pawns move in. Use the fact black and white pawns do the same thing but in opposite directions.
				var direction = (piece === "p") ? 1 : -1;
				var boardWithDefaultExtState = gamestate.substring(0, 72) + '|' + defaultExtendedState; 

				var newCoords = transCoords(coord, 0, direction * 1);
				
				// Pawn can move forwards
				if( newCoords && getPiece2(gamestate, newCoords) === "_" ){
					
					var totalstate = calculateBoardState2(boardWithDefaultExtState, coord, '_', newCoords, piece);
	
					
					if(newCoords.match('.8') || newCoords.match('.1')){ 

						// Pawn Promotions are encoded by adding the coords the pawn ended up on. 
						// promotionContext = newCoords;
						var placeHolderQueen = isItWhitesTurn ? 'q' : 'Q';
						CandidateLegalMoves[newCoords] = calculateBoardState(totalstate, newCoords, placeHolderQueen);
					}else{
						CandidateLegalMoves[newCoords] = totalstate;
					}
					
					
					// Can move 2 spaces on first move. If so, it becomes enpassantable
					if((piece === 'p' && coord.match('.2')) || (piece === 'P' && coord.match('.7')))
					{
						newCoords = transCoords(coord, 0, direction * 2);
						if( getPiece2(gamestate, newCoords) === "_" )
						{
							var totalstate = calculateBoardState2(boardWithDefaultExtState, coord, '_', newCoords, piece);
							totalstate = totalstate.substring(0, 78) + transCoords(coord, 0, direction * 1); 	// This means the piece is enpassantable 
							CandidateLegalMoves[newCoords] = totalstate;
						}	
					}
				}			
				
				// Pawn can take diagonally - and enpassant diagonally
				var allCoords = [transCoords(coord, 1, direction * 1), transCoords(coord, -1, direction * 1) ];
				for(let newCoords of allCoords)
				{
					if(newCoords == null) { continue; }	
	
					var enpassantablePawn = gamestate.substring(78); // The coords of any enpassanable pawn is the 77-79th chars of the gamestate
					if( isEnemyPiece(getPiece2(gamestate, newCoords)) || (newCoords === enpassantablePawn) ) 
					{
						// In case pawn ends up on final rank, add the coords of the pawn which can be promoted to the state string.
						var promotion = (newCoords.match('.8') || newCoords.match('.1')) ? '' : newCoords;
						CandidateLegalMoves[newCoords] = calculateBoardState2(boardWithDefaultExtState, coord, '_', newCoords, piece) + promotion;
						
						// If this an en-passant, need to remove the enemy pawn. 
						if( newCoords ===  enpassantablePawn){
							var pawnToDeleteCoords =  transCoords(enpassantablePawn, 0, (-direction) * 1 );
							CandidateLegalMoves[newCoords] = calculateBoardState(CandidateLegalMoves[newCoords], pawnToDeleteCoords , '_');
						}else{

							// Pawn Promotions are encoded adding a placeholder queen and setting the promotionContext variable
							if(newCoords.match('.8') || newCoords.match('.1')){ 
								// promotionContext = newCoords;
								var placeHolderQueen = isItWhitesTurn ? 'q' : 'Q';
								CandidateLegalMoves[newCoords] = calculateBoardState(CandidateLegalMoves[newCoords], newCoords, placeHolderQueen);
							}


						}



					}
				}
				 
			break;
		case 'R':
		case 'r':
			var rookExState = defaultExtendedState;
			// DISABLE CASTLING WHEN ROOK MOVES - MODIFYING EXTENDED STATE
			switch(coord)
			{
				// This indicates rook has moved from starting square (or has moved from another rook's staring square, which doesnt matter).
				// Here we disable the castling part of the extended state.
				case 'a1':  rookExState = rookExState.substring(0, 1) + 0 + rookExState.substring(2); break;
				case 'h1':  rookExState = rookExState.substring(0, 2) + 0 + rookExState.substring(3); break;
				case 'a8':  rookExState = rookExState.substring(0, 3) + 0 + rookExState.substring(4); break;
				case 'h8':  rookExState = rookExState.substring(0, 4) + 0 + rookExState.substring(5); break;

			}

			var startX = coord.charCodeAt(0) - 96;
			var startY =  Number(coord[1]);

			findAllMovesInLine(0, +1, rookExState);
			findAllMovesInLine(+1, 0, rookExState);
			findAllMovesInLine(0, -1, rookExState);
			findAllMovesInLine(-1, 0, rookExState);	
			
				// TODO, catch the edge case of a rook being captured, and then replaced with the other allied rook in its starting square.
				// this currently does not have the castling rights disabled!
	
			if(CandidateLegalMoves['a1']){ CandidateLegalMoves['a1'] =  CandidateLegalMoves['a1'].substring(0, 74) + 0 + CandidateLegalMoves['a1'].substring(75); }
			if(CandidateLegalMoves['h1']){ CandidateLegalMoves['h1'] =  CandidateLegalMoves['h1'].substring(0, 75) + 0 + CandidateLegalMoves['h1'].substring(76); }
			if(CandidateLegalMoves['a8']){ CandidateLegalMoves['a8'] =  CandidateLegalMoves['a8'].substring(0, 76) + 0 + CandidateLegalMoves['a8'].substring(77); }
			if(CandidateLegalMoves['h8']){ CandidateLegalMoves['h8'] =  CandidateLegalMoves['h8'].substring(0, 77) + 0 + CandidateLegalMoves['h8'].substring(78); }

	break;
		case 'N':
		case 'n':

			let boardMissingKnight = calculateBoardState(gamestate.substring(0, 72) + '|' + defaultExtendedState, coord, '_');

			var startY = coord.charCodeAt(0) - 96; 
			var startX = Number(coord[1]);

			const coordChangeArray = [2, 1, -1, -2];
	
			for (const dy of coordChangeArray) {
			   
				var newY = startY + dy;
				if ( newY < 1 ||  newY > 8 ){ continue; }
				
				let iterDX = (dy == 1 || dy == -1) ? [2,-2] : [1,-1];
				for (const dx of iterDX) {
			   
					var newX = startX + dx;
					if ( newX < 1 ||  newX > 8 ){ continue; }
					
					// We have confirmed that the knight  is moving to somewhere still on the board. Resolve move state..
					var knightToCoord = String.fromCharCode(newY + 96) + newX;
					
					var pieceOnTargetSq = getPiece2(gamestate, knightToCoord);
	
					if( (pieceOnTargetSq === "_") || isEnemyPiece(pieceOnTargetSq) ){ 
						let newGameState = calculateBoardState(boardMissingKnight, knightToCoord, piece);
						CandidateLegalMoves[knightToCoord] = newGameState;
					}
				}
			}

		break;
		case 'b':
		case 'B':			
			var startX = coord.charCodeAt(0) - 96;
			var startY =  Number(coord[1]);
			
			findAllMovesInLine(+1, +1, defaultExtendedState);
			findAllMovesInLine(+1, -1, defaultExtendedState);
			findAllMovesInLine(-1, +1, defaultExtendedState);	
			findAllMovesInLine(-1, -1, defaultExtendedState);

		break;
		case 'k':
		case 'K':
			
			var allCoords = [transCoords(coord, 1, 1), transCoords(coord, 1, 0), transCoords(coord, 1, -1), transCoords(coord, 0, 1),	
							 transCoords(coord, 0, -1), transCoords(coord, -1, -1), transCoords(coord, -1, 0), transCoords(coord, -1, 1) ];
			
			for(let possCoords of allCoords){
				// Possible null value error here..
				if( !possCoords ){ continue; }

				var pieceOnTargetSquare = getPiece2(gamestate, possCoords);
				if( (pieceOnTargetSquare == '_') || isEnemyPiece(pieceOnTargetSquare) ){
					
					// Moving the king prevents castling
					var newExtendedState = defaultExtendedState;	
					if( piece == 'k' ){  
						newExtendedState = newExtendedState.substring(0, 1) + '0' + newExtendedState.substring(2); 
						newExtendedState = newExtendedState.substring(0, 2) + '0' + newExtendedState.substring(3); 
					}
					if( piece == 'K'){
						newExtendedState = newExtendedState.substring(0, 3) + '0' + newExtendedState.substring(4); 
						newExtendedState = newExtendedState.substring(0, 4) + '0' + newExtendedState.substring(5); 
					}
					CandidateLegalMoves[possCoords] = calculateBoardState2(gamestate, coord, '_', possCoords, piece).substring(0, 72) + '|' +  newExtendedState;
			
				}
			}
			
			// IF ABLE TO CASTLE...
			if(isItWhitesTurn){

				// White long/a1 side castle.  king starts at E1, and moves to B1
				if(gamestate[74] == 1){
					if( (getPiece2(gamestate, 'b1')==='_') && (getPiece2(gamestate, 'c1')==='_') && (getPiece2(gamestate, 'd1')==='_') ){ 
						// king starts at E1, and moves to B1. Rook starts at A1 and finishes at B1
						// Verify not initially in check, and all intermediate squares are not threatened.
						if( ! amIInCheck(gamestate, isItWhitesTurn) ){
						
							var intState1 = calculateBoardState2(gamestate, 'e1', '_', 'd1', 'k');
							if( !amIInCheck(intState1, isItWhitesTurn) ){
								
								var intState2 = calculateBoardState2(intState1, 'd1', '_', 'c1', 'k');
								if( !amIInCheck(intState2, isItWhitesTurn) ){
									
									var intState3 = calculateBoardState2(intState2, 'c1', '_', 'b1', 'k'); // no need to check this state 
									var finalState = calculateBoardState2(intState3, 'a1', '_', 'c1', 'r'); // This gets checked later
													
									var ExStateWhiteCantCastle = defaultExtendedState.substring(0, 1) + '00' + defaultExtendedState.substring(3); 
									
									CandidateLegalMoves['a1'] = finalState.substring(0, 72) + '|' +  ExStateWhiteCantCastle;
								}
							}
						}
					}
				}
				
				// White short (right) / h1 side castle. 
				if(gamestate[75] == 1){
					if( (getPiece2(gamestate, 'f1')==='_') && (getPiece2(gamestate, 'g1')==='_')  ){ 
						// king starts at e1, and moves to g1. Rook starts at h1 and finishes at f1
						// Verify not initially in check, and all intermediate squares are not threatened.
						if( ! amIInCheck(gamestate, isItWhitesTurn) ){
						
							var intState1 = calculateBoardState2(gamestate, 'e1', '_', 'f1', 'k');
							if( !amIInCheck(intState1, isItWhitesTurn) ){
								
								var intState2 = calculateBoardState2(intState1, 'f1', '_', 'g1', 'k'); // no need to check this state 
								var finalState = calculateBoardState2(intState2, 'h1', '_', 'f1', 'r'); // This gets checked later
								
								var ExStateWhiteCantCastle = defaultExtendedState.substring(0, 1) + '00' + defaultExtendedState.substring(3); 

								CandidateLegalMoves['h1'] = finalState.substring(0, 72) + '|' +  ExStateWhiteCantCastle;
							}
						}
					}
				}
			}else{
				// black long/left/a8 side castle.  king starts at e8, and moves to b8
				if(gamestate[76] == 1){
					if( (getPiece2(gamestate, 'b8')==='_') && (getPiece2(gamestate, 'c8')==='_') && (getPiece2(gamestate, 'd8')==='_') ){ 
						// king starts at E1, and moves to B1. Rook starts at A1 and finishes at B1
						// Verify not initially in check, and all intermediate squares are not threatened.
						if( ! amIInCheck(gamestate, isItWhitesTurn) ){
						
							var intState1 = calculateBoardState2(gamestate, 'e8', '_', 'd8', 'K');
							if( !amIInCheck(intState1, isItWhitesTurn) ){
								
								var intState2 = calculateBoardState2(intState1, 'd8', '_', 'c8', 'K');
								if( !amIInCheck(intState2, isItWhitesTurn) ){
									
									var intState3 = calculateBoardState2(intState2, 'c8', '_', 'b8', 'K'); // no need to check this state 
									var finalState = calculateBoardState2(intState3, 'a8', '_', 'c8', 'R'); // This gets checked later
									
									var ExStateBlackCantCastle = defaultExtendedState.substring(0, 3) + '00' + defaultExtendedState.substring(5); 
									
									CandidateLegalMoves['a8'] = finalState.substring(0, 72) + '|' +  ExStateBlackCantCastle;
								}
							}
						}
					}
				}
				// black short (right) / a8 side castle. 
				if(gamestate[77] == 1){
					if( (getPiece2(gamestate, 'f8')==='_') && (getPiece2(gamestate, 'g8')==='_')  ){ 
						// king starts at e8, and moves to g8. Rook starts at h8 and finishes at f8
						// Verify not initially in check, and all intermediate squares are not threatened.
						if( ! amIInCheck(gamestate, isItWhitesTurn) ){
						
							var intState1 = calculateBoardState2(gamestate, 'e8', '_', 'f8', 'K');
							if( !amIInCheck(intState1, isItWhitesTurn) ){
								
								var intState2 = calculateBoardState2(intState1, 'f8', '_', 'g8', 'K'); // no need to check this state 
								var finalState = calculateBoardState2(intState2, 'h8', '_', 'f8', 'R'); // This gets checked later
								
								var ExStateBlackCantCastle = defaultExtendedState.substring(0, 3) + '00' + defaultExtendedState.substring(5); 

								CandidateLegalMoves['h8'] =  finalState.substring(0, 72) + '|' +  ExStateBlackCantCastle;
							}
						}
					}
				}
			}
		break;
		case 'q':
		case 'Q':
			var startX = coord.charCodeAt(0) - 96;
			var startY =  Number(coord[1]);
			
			findAllMovesInLine(+1,+1, defaultExtendedState);
			findAllMovesInLine(+1, 0, defaultExtendedState);	
			findAllMovesInLine(+1,-1, defaultExtendedState);
			findAllMovesInLine(0, +1, defaultExtendedState);	
			findAllMovesInLine(0, -1, defaultExtendedState);	
			findAllMovesInLine(-1,+1, defaultExtendedState);	
			findAllMovesInLine(-1, 0, defaultExtendedState);	
			findAllMovesInLine(-1,-1, defaultExtendedState);		
			break;
		case '_':
			previouslySelectedSquare = null;
			throw "This should not be possible - trying to move an empty square";
		default:
			throw ('Unknown piece: ' + piece);
	}	
	
	// Validate moves are not in checks
	for (const move of Object.keys(CandidateLegalMoves)){ 
		if(amIInCheck( CandidateLegalMoves[move], isItWhitesTurn)){
			delete CandidateLegalMoves[move];
		}
	}
	return CandidateLegalMoves;
		
}

function markLegalMoves(coord){

	// Mark the newly selected square.
	var currentSquare = document.getElementById(coord);	
	currentSquare.innerHTML = '<img src="assets/SelectedSquare.png" class="overlay" >' +  currentSquare.innerHTML; // Show green selection
	
	var legalMoves = getLegalMoves(coord, gamestate);
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

	// Rows are enumerated 'backwards' and are 9 chars long due to colon seperator.
	// Cols are determined by the leading letter. This formula converts a char into its corresponding integer from 0-7

	var index = 9 * (8 - coordinate[1]) + coordinate.charCodeAt(0) - 97;

	return gamestate[index];
}

function getPiece2(board, coordinate){

	// Rows are enumerated 'backwards' and are 9 chars long due to colon seperator.
	// Cols are determined by the leading letter. This formula converts a char into its corresponding integer from 0-7
	var index = 9 * (8 - coordinate[1]) + coordinate.charCodeAt(0) - 97;

	return board[index];
}

// UI related variables:
var previouslySelectedSquare = null;
var promotionContext = false;
function selectSquare(coord){

	console.log("clicked on " + coord);
	
	// Indicates the promotion window was open and should now be closed. 
	if(promotionContext){	
		// Close the pawn promotion window if player clicks off it.
		document.getElementById('chessboard').style.opacity = 1.0;
		document.getElementById('promotionOverlay').style.display = 'none';
		document.getElementById('promotionOverlayBlack').style.display = 'none';

		promotionContext = false;
		renderBoard(gamestate);

		// TODO, have this work if you click off of the board all together.
		return;
	}
	
	// If still waiting for the CPU to play
	if( gameMetaData.isWhiteCPU &&  (gamestate.isWhitesTurn()) ){ console.log("White to play. Waiting for CPU"); return;} 
	if( gameMetaData.isBlackCPU && !(gamestate.isWhitesTurn()) ){ console.log("Black to play. Waiting for CPU"); return;} 
	
	// Click on a square to display legal moves.
	if(previouslySelectedSquare == null){
	
		var newSelectedPiece = getPiece(coord);
		if(newSelectedPiece == '_'){		
			console.log("Selected empty square, nothing to do");
			return;
		}
		if( gamestate.isWhitesTurn() && (newSelectedPiece != newSelectedPiece.toLowerCase())){		
			console.log("// white tried to select their opponent's piece");
			return;
		}			
		if(!gamestate.isWhitesTurn() && (newSelectedPiece != newSelectedPiece.toUpperCase())){		
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
		var legalMoves = getLegalMoves(previouslySelectedSquare, gamestate);
		
		if(legalMoves[coord]){
			
			// PROMOTION LOGIC: Check that a pawn is being moved to the last rank.
			if(getPiece(previouslySelectedSquare).toLowerCase() == 'p' && (coord.match('.8') || coord.match('.1')) ){ 
				
				console.log("PROMOTION LOGIC");
				// Show pawn promotion window
				promotionContext = previouslySelectedSquare + ';' + coord;
				renderBoard(gamestate, promotionContext);

				document.getElementById('chessboard').style.opacity = 0.3;
				
				if(gamestate.isWhitesTurn()){
					document.getElementById('promotionOverlay').style.display = 'block';
				}else{
					document.getElementById('promotionOverlayBlack').style.display = 'block';
				}
				return;
			}
			
			// PROCESS NON-PROMOTION MOVE:
			gamestate = legalMoves[coord];
			renderBoard(gamestate, (coord + ';' + previouslySelectedSquare));

			// Update turn 
			EndTurn();
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
	var startingState = "RNBQKBNR;PPPPPPPP;________;________;________;________;pppppppp;rnbqkbnr;|11111__"

	gamestate = startingState;
	renderBoard(startingState, null);
}

function renderBoard(state, highlightedSquares){

	var rows = state.substring(0, 72).split(';');
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
	
	var isInCheck = amIInCheck(state, state.isWhitesTurn());
	if(isInCheck){
		// Get Location of the King:
		var kingIndex =   state.isWhitesTurn()  ? state.indexOf('k') : state.indexOf('K'); 
		var letterCoord =  (kingIndex % 9) + 1 ;
		var numberCoord =  (8 -  Math.floor(kingIndex / 9));
		var kingsCoords = String.fromCharCode(letterCoord + 96) + numberCoord;
		
		var checkSquare =  document.getElementById(kingsCoords);
		checkSquare.innerHTML = '<img src="assets/Check.png" height = 98px width = 98px, style = "opacity: 1"  >' +  checkSquare.innerHTML ;
		
		// var checkSquare2 =  document.getElementById(isInCheck);
		// checkSquare2.innerHTML = '<img src="assets/Check.png"height = 97px width = 97px  >' +  checkSquare2.innerHTML ;
	}
	
	// Highlight squares.
	if(highlightedSquares){
		var highlightCoords = highlightedSquares.split(';');
		for(let coords of highlightCoords){
			var highlightMe = document.getElementById(coords);
			highlightMe.innerHTML = '<img src="assets/LastMovedPiece.png" height = 98px width = 98px, style = "opacity: 0.6"  >' +  highlightMe.innerHTML ;
		}
	}
}
function existsLegalMoves(gamestate){

	var referenceState;
	if(gamestate.isWhitesTurn()){
		referenceState = gamestate.toLowerCase();
	}else{
		referenceState = gamestate.toUpperCase();
	}
	
	for (let x = 0; x < 72 ; x++) {
		if(referenceState[x] === '_' || referenceState[x] === ';'  ){continue;}
		if(referenceState[x] === gamestate[x]){
			// indicates is allied piece.
			// TODO: calculate coords.
			
			var letterCoord =  (x % 9) + 1 ;
			var numberCoord =  (8 -  Math.floor(x / 9));
			var currentPieceCoords = String.fromCharCode(letterCoord + 96) + numberCoord;
			
			if(Object.keys(getLegalMoves(currentPieceCoords, gamestate)).length > 0){
				return true; // some legal move exists - not in stale/check-mate
			}
		}
	}
	return false;
}

function EndTurn(){
	previouslySelectedSquare = null;
	promotionContext = false;

	// Check if in stalemate / checkmate
	// Use this to get next possible moves from this state. First get all allied piece (this is for speed)

	
	// Handle stalemate / checkmate 
	var legalMoves = existsLegalMoves(gamestate);
	if(!legalMoves){
		console.log('no moves found');
		if(amIInCheck(gamestate, gamestate.isWhitesTurn())){
			checkmate();
			return;
		}else{
			stalemate();
			return;
		}
	}

	// CPU move. Process move
	setTimeout( async function(){
		if( (gameMetaData.isWhiteCPU &&  (gamestate.isWhitesTurn())) || (gameMetaData.isBlackCPU && !(gamestate.isWhitesTurn()))){ 
			
			var totalstate =  await calculateBestMove(gamestate); 

			// Work out which coordinates have changed.
			var changedCoords = [];
			for (let x = 0; x < 72 ; x++) {
				if(totalstate[x] !== gamestate[x]){
					var letterCoord =  (x % 9) + 1 ;
					var numberCoord =  (8 -  Math.floor(x / 9));
					var currentPieceCoords = String.fromCharCode(letterCoord + 96) + numberCoord;
					changedCoords.push( currentPieceCoords);
				}
			}
			changedCoords = changedCoords.join(';');

			gamestate = totalstate;

			renderBoard(gamestate, changedCoords);
			EndTurn();
	}} , 20)

	return;
	
	// END TODO 
}


function checkmate(){
	var loosingTeamIsWhite = gamestate.isWhitesTurn();
	if(loosingTeamIsWhite){
		console.log('Black won!');
		document.body.innerHTML += '<p> Black Won!</p>';
	}else{
		console.log('White won!');
		document.body.innerHTML += '<p> White Won!</p>';
	}
	
}
function stalemate(){
	console.log("stalemate!");
	document.body.innerHTML += '<p> Stalemate!</p>';
}

function promotePawn(newPiece){
	
	// Process Move
	console.log("Promotion context@ " + promotionContext);

	var pawnFrom = promotionContext.split(';')[0];
	var pawnTo = promotionContext.split(';')[1];

	var placeholderstate = getLegalMoves(pawnFrom, gamestate)[pawnTo];
	gamestate = calculateBoardState(placeholderstate, pawnTo, newPiece);
	
	renderBoard(gamestate, promotionContext);
	
	// Hide the overlay
	document.getElementById('chessboard').style.opacity = 1.0;
	document.getElementById('promotionOverlay').style.display = 'none';
	document.getElementById('promotionOverlayBlack').style.display = 'none';
	
	EndTurn();
}