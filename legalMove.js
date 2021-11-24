var LegalMoves = {};
LegalMoves["a1"] = {gamestate : 'sugma', extendedState : {
		"isWhitesTurn": true,
		"whiteACastleable": true}};


console.log(LegalMoves["a1"].extendedState);


function getLegalMoves(coord){
	
		
		var piece = getPiece(coord);
		var CandidateLegalMoves = {};
		
		// Assume that enpassanable will be no unless specified.
		// CandidateLegalMoves[newCoords] = {gamestate : calculateBoardState(calculateBoardState(gamestate, coord, '_'), newCoords, piece), extendedStateChange : {"EnpassanablePawn": 'h1'}, promotion: true};

		function isEnemyPiece(piece){
			// possible performance increase by replacing this with "isAlliedPiece" and changing logic
			if(piece === "_") {return false;}
			
			var isWhitePiece  = (piece == piece.toLowerCase());
			return !(isWhitePiece === extendedState.isWhitesTurn);
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

		function amIInCheck(){
			// TODO
		}

		

		function findAllMovesInLine(x,y){
			var iter = 1;
			var newCoords = transCoords(coord, x * iter, y * iter);
			while( newCoords ){
				if(getPiece(newCoords) == '_'){
					CandidateLegalMoves[newCoords] = { gamestate : calculateBoardState(calculateBoardState(gamestate, coord, '_'), newCoords, piece) };
				}else{ 
					if(isEnemyPiece(getPiece(newCoords))){
						CandidateLegalMoves[newCoords] = { gamestate : calculateBoardState(calculateBoardState(gamestate, coord, '_'), newCoords, piece) };
						break; // If can capture, cant carry on after.
					}else{
						break; // Cannot take own piece
					}
				}
				iter++;
				newCoords = transCoords(coord,x * iter, y * iter);
				
			}
		}

		if( piece == 'R' || piece == 'r' ){  
			
			findAllMovesInLine(0,1);
			findAllMovesInLine(1,0);
			findAllMovesInLine(0,-1);
			findAllMovesInLine(-1,0);

		}
		if( piece == 'N' || piece == 'n' ){  
			
			var allCoords = [transCoords(coord, 1, 2), transCoords(coord, 1, -2), transCoords(coord, -1, 2), transCoords(coord, -1, -2),	
				transCoords(coord, 2, 1), transCoords(coord, 2, -1), transCoords(coord, -2, 1), transCoords(coord, -2, -1) ];
			
			for(var possCoords of allCoords){
				// Possible null value error here..
				if( !possCoords ){ continue; }
				if( (getPiece(possCoords) == '_') || isEnemyPiece(getPiece(possCoords)) ){
					CandidateLegalMoves[possCoords] = { gamestate : calculateBoardState(calculateBoardState(gamestate, coord, '_'), possCoords, piece) };
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
					var extendedState = {}
					if( piece == 'k' ){  
						extendedState[whiteACastleable] = false;
						extendedState[whiteHCastleable] = false;
					}
					if( piece == 'K'){
						extendedState[blackACastleable] = false;
						extendedState[blackACastleable] = false;
					}
					CandidateLegalMoves[possCoords] = { gamestate : calculateBoardState(calculateBoardState(gamestate, coord, '_'), possCoords, piece), extendedStateChange : extendedState };
				}		
			}
			// TODO: Castling rules
			
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
				CandidateLegalMoves.push(newCoords);
				
				var promotion = newCoords.match('.8') || newCoords.match('.1');
				CandidateLegalMoves[newCoords] = { gamestate : calculateBoardState(calculateBoardState(gamestate, coord, '_'), newCoords, piece), promotion: promotion };
				
				// Can move 2 spaces on first move:
				if((piece === 'p' && coord.match('.2')) || (piece === 'P' && coord.match('.7'))){
					newCoords = transCoords(coord, 0, direction * 2);
					if( newCoords && getPiece(newCoords) === "_" ){
						CandidateLegalMoves[newCoords] = { gamestate : calculateBoardState(calculateBoardState(gamestate, coord, '_'), newCoords, piece), extendedStateChange : {enpassanable: transCoords(coord, 0, direction * 1)}};
					}	
				}

			}			
			
			// Pawn can take diagonally
			newCoords = transCoords(coord, 1, direction * 1);
			if(  newCoords && (isEnemyPiece(getPiece(newCoords)) || (newCoords === extendedState.enpassanable)) ){
				var promotion = newCoords.match('.8') || newCoords.match('.1');
				CandidateLegalMoves[newCoords] = { gamestate : calculateBoardState(calculateBoardState(gamestate, coord, '_'), newCoords, piece), promotion: promotion };
			}
			newCoords = transCoords(coord, -1, direction * 1);
			if(  newCoords && (isEnemyPiece(getPiece(newCoords)) || (newCoords === extendedState.enpassanable) ) ){
				var promotion = newCoords.match('.8') || newCoords.match('.1');
				CandidateLegalMoves[newCoords] = { gamestate : calculateBoardState(calculateBoardState(gamestate, coord, '_'), newCoords, piece), promotion: promotion };
			}
			
		

			
		 } 
		 
		if( piece == '_'){
			throw "This should not be possible - trying to move an empty square"
		}
		// TODO: Validate not in checks
		return CandidateLegalMoves;
			
	}