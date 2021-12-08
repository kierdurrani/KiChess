function getAllNightMoves(){
   
    let boardMissingKnight = calculateBoardState(boardWithDefaultExtState, coord, '_');
    
    var startY = coord.charCodeAt(0) - 96; 
	var startX = Number(coord[1]);

    const coordChangeArray = [2, 1, -1, -2];

    for (const dy of coordChangeArray) {
       
        var newY = startY + dy;
        if ( newY < 1 ||  newY > 8 ){ continue; }
        
        for (const dx of coordChangeArray) {
       
            var newX = startX + dx;
            if ( newX < 1 ||  newX > 8 ){ continue; }
            
            // We now know the knight move is to somewhere still on the board. Resolve move
            var knightToCoord = String.fromCharCode(newY + 96) + newX;
            let newGameState = calculateBoardState(boardMissingKnight, knightToCoord, piece);
            CandidateLegalMoves[newGameState] = newGameState;
        }
    }
}



var allCoords = [transCoords(coord, 1, 2), transCoords(coord, 1, -2), transCoords(coord, -1, 2), transCoords(coord, -1, -2),	
                 transCoords(coord, 2, 1), transCoords(coord, 2, -1), transCoords(coord, -2, 1), transCoords(coord, -2, -1) ];

for(var possCoords of allCoords){
    if( !possCoords ){ continue; } // Catch possible null value error here..

    var pieceOnTargetSq = getPiece2(gamestate, possCoords);
    if( (pieceOnTargetSq === '_') || isEnemyPiece(pieceOnTargetSq) ){
    let newGameState = calculateBoardState(, possCoords, piece);
    CandidateLegalMoves[possCoords] = newGameState;
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