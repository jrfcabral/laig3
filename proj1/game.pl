:- use_module(library(random)).
:- use_module(library(system)).
:- use_module(library(lists)).
:- include('board.pl').
:- include('util.pl').
:- include('io.pl').
:- include('bot.pl').


:- dynamic(silverPieces/1).
:- dynamic(goldenPieces/1).
:- dynamic(gameState/2).
:- dynamic(position/3).
:- dynamic(player/1).
:- dynamic(currentPlayer/1).
:- dynamic(moved/1).
:- dynamic(moved/2).
:- dynamic(captured/0).

piece(goldenPiece).
piece(silverPiece).
piece(flagship).

player(goldenPlayer).
player(silverPlayer).

flagships(1).

owner(goldenPlayer, goldenPiece).
owner(silverPlayer, silverPiece).
owner(goldenPlayer, flagship).
opponent(silverPlayer, goldenPlayer).
opponent(goldenPlayer, silverPlayer).

state(begin).
state(game).
state(over).

breakthru:-retractall(playerGolden(_)), retractall(playerSilver(_)),retractall(difficulty(_,_)),
mainMenu.


startGame:- retractall(position(_,_,_)), assert(goldenPieces(0)), assert(silverPieces(0)),
	setRandSeed,
	setupBoard,
	playGame.

playGame:-
	( (\+playerGolden(bot),readPlayer(Player, 'goldenPlayer chooses a player to start the game (goldenPlayer. or silverPlayer.).')); (playerGolden(bot), random(0, 2, N), nth0(N, [goldenPlayer, silverPlayer], Player)
	)),
assert(currentPlayer(Player)),
	repeat,
	retract(currentPlayer(CurrentPlayer)),
	retractall(moved(_)), retractall(moved(_,_)),retractall(captured),
	takeTurn(CurrentPlayer, NewPlayer),
	assert(currentPlayer(NewPlayer)),
	printBoard,
	wonGame(Victor),!, clearScreen,
	write(Victor),write(' won the game!').

wonGame(goldenPlayer):- position(_,0,flagship);position(0,_,flagship);position(10,_,flagship);position(_,10,flagship);\+position(_,_,silverPiece).
wonGame(silverPlayer):- \+position(_,_,flagship).

takeTurn(goldenPlayer, silverPlayer):-
playerGolden(human), doPlayerMovement(goldenPlayer), printBoard,( (\+moved(flagship), \+captured, printBoard, doPlayerMovement(goldenPlayer)); (moved(flagship);captured)),!.

takeTurn(goldenPlayer, silverPlayer):-
playerGolden(bot), difficulty(goldenPlayer, random), randomPlay(goldenPlayer, Pred1), Pred =.. Pred1, Pred, printBoard,
((\+moved(flagship),\+captured, randomMove(goldenPlayer, Pred2), PredD =.. Pred2, PredD);((moved(flagship);captured), printBoard)), !.

takeTurn(goldenPlayer, silverPlayer):-
	 playerGolden(bot), difficulty(goldenPlayer, greedy),
	 ((flagshipCanEscape(Xf, Yf), position(X, Y, flagship), doPlay(X, Y, Xf, Yf, goldenPlayer));
	 (validCapture(X,Y,Xf,Yf, goldenPlayer), doPlay(X,Y,Xf,Yf, goldenPlayer));
	 (randomMove(goldenPlayer, Pred1), Pred =.. Pred1, Pred)),!,
	 (  (moved(flagship);captured;wonGame(_));
	 	 (\+captured,\+moved(flagship),\+wonGame(_), randomMove(goldenPlayer, Pred2), PredD =.. Pred2, PredD)),!.


takeTurn(silverPlayer, goldenPlayer):-
playerSilver(human), doPlayerMovement(silverPlayer), printBoard, ((\+captured,doPlayerMovement(silverPlayer));captured),!.

takeTurn(silverPlayer, goldenPlayer):-
playerSilver(bot), difficulty(silverPlayer, random), randomPlay(silverPlayer, Pred1), Pred =.. Pred1, Pred, (captured;(\+captured,randomMove(silverPlayer, Pred2), PredD =.. Pred2, PredD)), printBoard, !.

takeTurn(silverPlayer, goldenPlayer):-playerSilver(bot), difficulty(silverPlayer, greedy),
( ( blockFlagship(X,Y,Xf,Yf), doPlay(X,Y,Xf,Yf,silverPlayer));
	(validCapture(X,Y,Xf,Yf, silverPlayer), doPlay(X,Y,Xf,Yf,silverPlayer));
	(randomMove(silverPlayer, Pred1), Pred =.. Pred1, Pred)),!,
(  captured;
	 (\+captured, blockFlagship(X,Y,Xf,Yf), doPlay(X,Y,Xf,Yf,silverPlayer));
	 (\+captured, randomMove(silverPlayer, Pred2), PredD =.. Pred2, PredD)),!.

doPlayerMovement(Player):-
	repeat,write(Player), write(' chooses a piece to move:'), nl,
	readCoordinates(Xi,Yi),owner(Player,Piece),position(Xi,Yi,Piece),\+moved(Xi,Yi), !,
	nl,write('destination:'),nl,
	repeat,
	readCoordinates(Xf,Yf),
	validPlay(Xi,Yi,Xf,Yf,Player),!,
	position(Xi,Yi,Piece),
	asserta(moved(Piece)),
	doPlay(Xi,Yi,Xf,Yf,Player).

setupRemoteBoard:-
	fillBoard,
	asserta(position(5,5,flagship)),
	asserta(nextPlayer(goldenPlayer)),
	asserta(nextAction(place)),
	asserta(silverPieces(0)),
	asserta(goldenPieces(0)).	


setupBoard:-
	fillBoard,
	asserta(position(5,5,flagship)),
	placePiece(goldenPlayer, 0).

placePiece(goldenPlayer, 12):- placePiece(silverPlayer, 0).
placePiece(goldenPlayer, N):-playerGolden(human),
	N1 is N+1, N < 12,
	write('New piece for golden player:'), nl,
	repeat,
	readCoordinates(X,Y),
	validateCoordinates(X,Y, goldenPlayer),!,
	asserta(position(X,Y,goldenPiece)),
	printBoard,!,
	placePiece(goldenPlayer, N1).

placePiece(goldenPlayer,N):-
	playerGolden(bot),
	N1 is N+1, N < 12,
	randomPlacement(goldenPlayer, X, Y),
	asserta(position(X,Y,goldenPiece)),
	printBoard,!,
	placePiece(goldenPlayer, N1).

	placePiece(silverPlayer,N):-playerSilver(bot), difficulty(silverPlayer, greedy),blockFlagshipPlacement, N1 is N-1, printBoard, !, placePiece(silverPlayer, N-1).

	placePiece(silverPlayer,N):-
		playerSilver(bot),
		N1 is N+1, N < 20,
		randomPlacement(silverPlayer, X, Y),
		asserta(position(X,Y,silverPiece)),
		printBoard,!,
		placePiece(silverPlayer, N1).


placePiece(silverPlayer, 20).
placePiece(silverPlayer, N):- N1 is N+1, N< 20,
	write('New piece for silver player:'), nl,
	repeat,
	readCoordinates(X,Y),
	validateCoordinates(X,Y, silverPlayer),!,
	asserta(position(X,Y,silverPiece)),
	printBoard,!,
	placePiece(silverPlayer, N1).




possiblePlace(Player, X, Y):-
	position(X,Y,emptyCell),
	findall(C, position(X,Y,C), [emptyCell]),
	validateCoordinates(X,Y,Player).


validateCoordinates( X, Y, goldenPlayer):-
	X > 2, X < 8,
	Y > 2, Y < 8,
	findall(Z, position(X,Y,Z), [emptyCell]).

validateCoordinates(X, Y, silverPlayer):-
	\+(validateCoordinates( X, Y, goldenPlayer)),
	findall(Z, position(X,Y,Z), [emptyCell]).

calculateDistances(Xi, Yi, Xf, Yf, DX, DY):-
	DX is Xf - Xi,
	DY is Yf - Yi.


	emptySpace(X,Y,Xf,Y):- X>Xf, X1 is X-1, emptyCellsBetween(X1,Y,Xf,Y).
	emptySpace(X,Y,Xf,Y):- X < Xf, X1 is X+1, emptyCellsBetween(X1, Y, Xf, Y).
	emptySpace(X,Y,X,Yf):- Y> Yf, Y1 is Y-1, emptyCellsBetween(X,Y1,X, Yf).
	emptySpace(X,Y,X,Yf):- Y < Yf, Y1 is Y+1, emptyCellsBetween(X,Y1,X,Yf).

	emptyCellsBetween(X,Y,X,Y):- findall(Z, position(X,Y,Z), [emptyCell]), !.
	emptyCellsBetween(X,Y,X,Yf):-Y>Yf,Y1 is Y-1, findall(Z, position(X,Y,Z), [emptyCell]), emptyCellsBetween(X,Y1,X,Yf).
	emptyCellsBetween(X,Y,X,Yf):-Yf1 is Yf-1, findall(Z, position(X,Yf,Z), [emptyCell]), emptyCellsBetween(X,Y,X,Yf1).
	emptyCellsBetween(X,Y,Xf,Y):-X>Xf,X1 is X-1, findall(Z, position(X,Y,Z), [emptyCell]), emptyCellsBetween(X1,Y,Xf,Y).
	emptyCellsBetween(X,Y,Xf,Y):-Xf1 is Xf-1, findall(Z, position(Xf,Y,Z), [emptyCell]), emptyCellsBetween(X,Y,Xf1,Y).

doPlay(X,Y,Xf,Yf,Player):- validMove(X,Y,Xf,Yf,Player),
	owner(Player,Piece),retract(position(X,Y,Piece)),asserta(position(Xf,Yf,Piece)), asserta(moved(Xf,Yf)).

doPlay(X,Y,Xf,Yf,Player):- validCapture(X,Y,Xf,Yf,Player),
	owner(Player,Piece), retract(position(X,Y,Piece)),opponent(Player, Opponent), owner(Opponent,OpponentPiece), retract(position(Xf,Yf,OpponentPiece)), asserta(position(Xf,Yf,Piece)),asserta(captured), asserta(moved(Xf,Yf)).

validPlay(X,Y,Xf,Yf,Player):- (validMove(X,Y,Xf,Yf,Player);validCapture(X,Y,Xf,Yf,Player)),\+moved(X,Y).

validCapture(X,Y,Xf,Yf,Player):-
 owner(Player, Piece),
 position(X,Y,Piece),
 opponent(Player, Opponent),
 owner(Opponent,OpponentPiece),
 position(Xf,Yf,OpponentPiece),
 (X =:= Xf-1; X =:= Xf+1),
 (Y =:= Yf-1; Y =:= Yf+1).

validMove(X,Y,Xf,Yf, Player):- %movimento normal
owner(Player, Piece),
position(X,Y,Piece),
position(Xf,Yf, emptyCell),
findall(Z, position(Xf,Yf,Z), [emptyCell]),
emptySpace(X,Y,Xf,Yf).

flagshipCanEscape(X,Y):-
	position(Fx,Fy,flagship),
	( ( emptySpace(Fx,Fy,X,10), Y is 10);
		(emptySpace(Fx,Fy,X,0), Y is 0);
		(emptySpace(Fx,Fy,10,Y), X is 10);
		(emptySpace(Fx,Fy,0,Y), X is 0) ).




placeRemotePiece(X, Y, silverPlayer):-
	validateCoordinates(X,Y,silverPlayer),
	asserta(position(X,Y,silverPiece)),
	retract(silverPieces(X)),
	x1 is X+1,
	asserta(silverPieces(X1)),
	( X1 == 12 ->
		retract(nextPlayer(_)),
		asserta(nextPlayer(goldenPlayer)),
		retract(nextAction(_)),
		assert(nextAction(play));
		true).

placeRemotePiece(X, Y, goldenPlayer):-
	validateCoordinates(X,Y,goldenPlayer),
	asserta(position(X,Y,goldenPiece)),
	retract(goldenPieces(X)),
	x1 is X+1,
	asserta(goldenPieces(X1)),
	(X1 == 19 ->
		retract(nextPlayer(_)),
		asserta(nextPlayer(silverPlayer));
		true).