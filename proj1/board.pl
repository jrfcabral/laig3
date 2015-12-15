symbol(emptyCell, ' ').
symbol(flagship, 'F').
symbol(silverPiece, 'p').
symbol(goldenPiece, 'd').

printBoard:- clearScreen, printBoard(0,0),!.

printBoard(_,11):- write(' ----------------------------------------------'),nl,
	write('   0   1   2   3   4   5   6   7   8   9  10'), nl.
printBoard(X,Y):- Y1 is Y+1,
 write(' ---------------------------------------------'),nl,
 write(Y),
 printBoardLine(X,Y),
 printBoard(X,Y1).

printBoardLine(11,_):- write('|'), nl.
printBoardLine(X,Y):- X1 is X+1, position(X,Y, Piece), symbol(Piece, Symb),
write('|'),write(' '), write(Symb), write(' '), printBoardLine(X1, Y).

fillBoardLine(11,Y).
fillBoardLine(X,Y):-assertz(position(X,Y, emptyCell)), X1 is X+1, fillBoardLine(X1,Y).

fillBoard(X,11).
fillBoard(X,Y):-fillBoardLine(X,Y), Y1 is Y+1, fillBoard(X,Y1).

fillBoard:- fillBoard(0,0).
