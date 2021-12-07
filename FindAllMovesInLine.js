var xCoord;
var yCoord; // TODO, fill these in
function findAllMovesInLine(x, y, extendedState){
	
    var iter = 1;
    var newCoords = transCoords(coord, x * iter, y * iter);

    while( newCoords )
    {
        var pieceOnSquare = getPiece2(gamestate, newCoords);
        if(  pieceOnSquare == '_'){
            
            // Modify the board state to the new state and appednd the 
            var newBoardState = 
            CandidateLegalMoves[newCoords] =  calculateBoardState(calculateBoardState(boardWithDefaultExtState, coord, '_'), newCoords, piece);
            
        }else{ 
            if(isEnemyPiece(pieceOnSquare)){

                // Modify the board state to the new state and appednd the 
                CandidateLegalMoves[newCoords] =   calculateBoardState(calculateBoardState(boardWithDefaultExtState, coord, '_'), newCoords, piece);

                break; // Can capture an enemy piece, but cant keep moving after.
            }else{
                break; // Cannot capture allied piece, or jump over it.
            }
        }
        iter++;
        newCoords = transCoords(coord, x * iter, y * iter);
    }
}


function getVisibleEnemyToKing(x, y){
		
    var iter = 1;
    
    var newX = kingX + x;
    var newY = kingY + y;   
    while( newX <= 8 && newY <= 8 && newX >= 1 && newY >= 1 ){

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