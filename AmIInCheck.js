
function amIInCheck3(board, isWhiteTeam)
{
	
	// Overview of logic: start from the king and see if the king is in vision by an enemy piece
	// team == true -> white 

	// Get coordinates of the king.
	var kingIndex = isWhiteTeam ? board.indexOf('k') : board.indexOf('K'); // position of king in string
	// console.log("index: " + kingIndex);
	
	var kingX =  (kingIndex % 9) + 1 ;
	var kingY =  (8 -  Math.floor(kingIndex / 9));
	
	var letterCoord =  (kingIndex % 9) + 1 ;
	var numberCoord =  (8 -  Math.floor(kingIndex / 9));
	var kingsCoords = String.fromCharCode(letterCoord + 96) + numberCoord;
	// console.log("I think the king is at: " + kingsCoords);


    function transKingCoords(dy, dx){
        var newY = kingY + dy; 
        var newX = kingX + dx;
    
        if ( newY < 1 ||  newY > 8 ||  newX < 1 || newX > 8){
            return null; // off the board
        }else{
             return "" + newY + newX; // forces result to be string
        }
    }

	// Return the coordinates of an ENEMY PIECE (if any), at the end of the line (x,y) diagonal from startingCoord
	function getVisibleEnemyToKing(x, y){
		
		console.log(board);
		console.log(x + "," + y);
		var iter = 1;
		
        var newX = kingX + x;
        var newY = kingY + y;

        while( newX <= 8 || newY <= 8 || newX >= 1 || newY >= 1 ){

            // Rows are enumerated 'backwards' and are 9 chars long due to colon seperator.
			var visiblePiece = board[9 * (8 - newY) + newX]; 

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
	
    for( var visibleEnemy of allVisibleDiagonals){
		if( !visibleEnemy ){ continue; } // Catch possible null value error here..
		if( ['b','B','q','Q'].includes(visibleEnemy.piece) ){ return true; }
	}
	
	// Threats vertically / horizontally (rooks/queens)
	var allVisibleDiagonals = [getVisibleEnemyToKing( +1, 0), getVisibleEnemyToKing( 0, -1), 
							   getVisibleEnemyToKing( -1, 0), getVisibleEnemyToKing( 0, +1)];	
                               
	for( var visibleEnemy of allVisibleDiagonals){
		if( !visibleEnemy ){ continue; } // Catch possible null value error here..
		if( ['r','R','q','Q'].includes(visibleEnemy.piece) ){ return true; }
	}
	
	// Threats from Pawns:
	var directionOfThreateningPawn = (isWhiteTeam ? 1 : -1 );
	
	if(isWhiteTeam){
		if( transCoords(kingsCoords, +1,  +1) && getPiece2(board, transCoords(kingsCoords, +1,  +1)) === 'P'){ return true; }
		if( transCoords(kingsCoords, -1,  +1) && getPiece2(board, transCoords(kingsCoords, -1,  +1)) === 'P'){ return true; }
	}else{
		if( transCoords(kingsCoords, +1,  -1) && getPiece2(board, transCoords(kingsCoords, +1,  -1)) === 'p'){ return true; }
		if( transCoords(kingsCoords, -1,  -1) && getPiece2(board, transCoords(kingsCoords, -1,  -1)) === 'p'){ return true; }
	}

	
	// Threats from knights:
	var possibleKnightCoords = [transCoords(kingsCoords, +1,  +2), transCoords(kingsCoords, +1,  -2), 
								transCoords(kingsCoords, -1,  +2), transCoords(kingsCoords, -1,  -2), 
								transCoords(kingsCoords, +2,  +1), transCoords(kingsCoords, +2,  -1), 
								transCoords(kingsCoords, -2,  +1), transCoords(kingsCoords, -2,  -1)];		
	for( var possCoords of possibleKnightCoords){
		if( !possCoords ){ continue; } // Catch possible null value error here..
		 
		if(  isWhiteTeam   && (getPiece2(board, possCoords) === 'N') ){ return true; } 
		if( (!isWhiteTeam) && (getPiece2(board, possCoords) === 'n') ){ return true; } 

	}
	
	// Finally, threats from king!
	var allCoords = [transCoords(kingsCoords, +1, +1), transCoords(kingsCoords, +1, +0), transCoords(kingsCoords, +1, -1), transCoords(kingsCoords, +0, +1),	
					 transCoords(kingsCoords, +0, -1), transCoords(kingsCoords, -1, -1), transCoords(kingsCoords, -1, +0), transCoords(kingsCoords, -1, +1) ];

	for(var possCoords of allCoords)
	{ 
		if( !possCoords ){ continue; }
		if( (getPiece2(board, possCoords) === 'K') || (getPiece2(board, possCoords) === 'k') ){
			return true;
		}
	}
	
	// else
	return false;
}
