var startX = Number(coord[1]);
var startY = coord.charCodeAt(0) - 96;
// var piece is defined outside
function findAllMovesInLine(dx, dy, extendedState){
	
    var iter = 1;
    
    var newX = startX + dx;
    var newY = startY + dy;
    
    const DefaultNextState = calculateBoardState(gamestate.substring(0, 72) + '|' + extendedState, coord, '_'); 

    while( newX <= 8 && newY <= 8 && newX >= 1 && newY >= 1 )
    {

        // Rows are enumerated 'backwards' and are 9 chars long due to colon seperator.
        // Cols are determined by the leading letter. This formula converts a char into its corresponding integer from 0-7

        var index = 9 * (8 - coordinate[1]) + coordinate.charCodeAt(0) - 97;
        var pieceOnSquare = DefaultNextState[index];

        if(  pieceOnSquare == '_'){
            // Represents the piece moving to an empty square
            CandidateLegalMoves[newCoords] = DefaultNextState.substring(0, index) + piece + DefaultNextState.substring(index + 1);
        }else{ 
            if(isEnemyPiece(pieceOnSquare)){

                // Represents the piece taking the enemy piece
                CandidateLegalMoves[newCoords] = DefaultNextState.substring(0, index) + piece + DefaultNextState.substring(index + 1);
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


function calculateBoardState(state, newX, newY, newPiece){
	// Modifies the board state 

	// Rows are enumerated 'backwards' and are 9 chars long due to colon seperator.
	// Cols are determined by the leading letter. This formula converts a char into its corresponding integer from 0-7
	var index = 9 * (8 - newY) + (newX - 1);
		
	return( state.substring(0, index) + newPiece + state.substring(index + 1) );
}

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