var piece = getPiece(coord);
var CandidateLegalMoves = [];

function transCoords(coord, x, y){
	var newRank = coord[0].charCodeAt(0) - 96 + y; 
	var newCol  = Number(coord[1]) + x;

	if ( newCol < 1 ||  newCol > 8 ||  newRank < 1 || newRank > 8){
		return null; // off the board
	}else{
		 return(String.fromCharCode(newRank + 96) + newCol);
	}
}

function getPiece(coordinate){

	var columnState = gamestate.split(";")[coordinate[1] - 1]; 
	
	var cellContent = columnState[columnIndex];      
	
	console.log("At coordinate: " + coordinate + " there is a " + cellContent );
	
	return cellContent;
}
	

function amIInCheck(){
	// TODO
}

function isEnemyPiece(){
	// possible performance increase by replacing this with "isAlliedPiece" and changing logic
	
	
}

function findAllMovesInLine(x,y){
	var iter = 1;
	var newCoords = transCoords(coord, x * iter, y * iter);
	while( newCoords ){
		if(getPiece(newCoords) == '_'){
			CandidateLegalMoves.push(newCoords);
			x++;
		}else{ 
			if(isEnemyPiece(getPiece(coord))){
				CandidateLegalMoves.push(newCoords);
				break; // If can capture, cant carry on after.
			}else{
				break; // Cannot take own piece
			}
		}
		newCoords = transCoords(coord,x * iter, y * iter);
		iter++;
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
	
	foreach(possCoords in allCoords){
		// Possible null value error here..
		if( (getPiece(newCoords) == '_') || isEnemyPiece(getPiece(newCoords)) ){
			CandidateLegalMoves.push(possCoords);
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
		
	foreach(possCoords in allCoords){
		// Possible null value error here..
		if( (getPiece(newCoords) == '_') || isEnemyPiece(getPiece(newCoords)) ){
			CandidateLegalMoves.push(possCoords);
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
if( piece == 'P' ){  
	// TODO
}
if( piece == 'p' ){ 
	
	
	if(coord.match('.2'){
		// starting square
	}else{
		
	} 
 } 
 
if( piece == '_'){
	throw "This should not be possible - trying to move an empty square"
}

return CandidateLegalMoves;
// TODO: Validate not in check