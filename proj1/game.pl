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
:- dynamic(remainingPlays/1).
:- dynamic(stateNumber/1).
:- dynamic(boardState/5).

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

tojs(emptyCell, 0).
tojs(silverPiece, 2).
tojs(goldenPiece, 1).
tojs(flagship, 3).


state(begin).
state(game).
state(over).

testeRemote:-
	setupRemoteBoard,
	placeRemotePiece(3,4,goldenPlayer),
	placeRemotePiece(4,4,goldenPlayer),
	placeRemotePiece(5,4,goldenPlayer),
	placeRemotePiece(6,4,goldenPlayer),
	placeRemotePiece(7,4,goldenPlayer),
	placeRemotePiece(3,5,goldenPlayer),
	placeRemotePiece(4,5,goldenPlayer),
	placeRemotePiece(6,5,goldenPlayer),
	placeRemotePiece(7,5,goldenPlayer),
	placeRemotePiece(6,6,goldenPlayer),
	placeRemotePiece(7,6,goldenPlayer),
	placeRemotePiece(3,6,goldenPlayer),
	placeRemotePiece(1,1,silverPlayer),
	placeRemotePiece(1,2,silverPlayer),
	placeRemotePiece(1,3,silverPlayer),
	placeRemotePiece(1,4,silverPlayer),
	placeRemotePiece(1,5,silverPlayer),
	placeRemotePiece(1,6,silverPlayer),
	placeRemotePiece(1,7,silverPlayer),
	placeRemotePiece(1,8,silverPlayer),
	placeRemotePiece(1,9,silverPlayer),
	placeRemotePiece(1,10,silverPlayer),
	placeRemotePiece(2,1,silverPlayer),
	placeRemotePiece(2,2,silverPlayer),
	placeRemotePiece(2,3,silverPlayer),
	placeRemotePiece(2,4,silverPlayer),
	placeRemotePiece(2,5,silverPlayer),
	placeRemotePiece(2,6,silverPlayer),
	placeRemotePiece(2,7,silverPlayer),
	placeRemotePiece(2,8,silverPlayer),
	placeRemotePiece(2,9,silverPlayer),
	placeRemotePiece(2,10,silverPlayer),
	doRemotePlay(4,4,4,0,goldenPlayer),
	doRemotePlay(4,0,4,4,goldenPlayer),
	doRemotePlay(1,10,0,10,silverPlayer),
	doRemotePlay(0,10,1,10,silverPlayer).




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
takeTurn(goldenPlayer, silverPlayer ):-
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
		retractall(remainingPlays(_)),
		assert(remainingPlays(2)),
	retractall(position(_,_,_)),
	retractall(boardState(_,_,_,_,_)),
	retractall(stateNumber(_)),
		fillBoard,
		assert(stateNumber(0)),
		asserta(position(5,5,flagship)),
		asserta(nextPlayer(goldenPlayer)),
		asserta(nextAction(place)),
		asserta(silverPieces(0)),
		asserta(goldenPieces(0)).


setupRemoteBoard:-
	retractall(remainingPlays(_)),
	retractall(boardState(_,_,_,_,_)),
	retractall(stateNumber(_)),
	assert(remainingPlays(2)),
	retract(silverPieces(_)),
	retract(goldenPieces(_)),
	retract(nextPlayer(_)),
	assert(nextPlayer(goldenPlayer)),
	retract(nextAction(_)),
	retractall(remainingPlays(_)),
	retractall(position(_,_,_)),
	fillBoard,
	asserta(position(5,5,flagship)),
	asserta(nextPlayer(goldenPlayer)),
	asserta(nextAction(place)),
	asserta(silverPieces(0)),
	asserta(goldenPieces(0)).


setupBoard:-
	retractall(remainingPlays(_)),
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

	placePiece(silverPlayer,N):-playerSilver(bot), difficulty(silverPlayer, greedy),blockFlagshipPlacement, N1 is N-1, printBoard, !, placePiece(silverPlayer, N1).

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
	owner(Player,Piece),printBoard,retract(position(X,Y,Piece)),asserta(position(Xf,Yf,Piece)), asserta(moved(Xf,Yf)),saveState,savePlay(X,Y,Xf,Yf,Player).

doPlay(X,Y,Xf,Yf,Player):- validCapture(X,Y,Xf,Yf,Player),
	owner(Player,Piece), printBoard,savePlay(X,Y,Xf,Yf,Player),retract(position(X,Y,Piece)),opponent(Player, Opponent), owner(Opponent,OpponentPiece), retract(position(Xf,Yf,OpponentPiece)), asserta(position(Xf,Yf,Piece)),asserta(captured), asserta(moved(Xf,Yf)),savePlay(X,Y,Xf,Yf,Player).

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

savePlay(X,Y,Xf,Yf,Player):-
	retract(stateNumber(N)),
	write('sucesso'),
	N1 is N+1,
	asserta(stateNumber(N1)),
	asserta(savedPlay(X,Y,Xf,Yf,Player,N1)).

saveState:-
	stateNumber(N),
	N1 is N+1,
	findall([X,Y,State], position(X,Y,State), Cs),
	nextPlayer(Player),
	nextAction(Action),
	remainingPlays(Plays),
	asserta(boardState(Cs, Player, Action, Plays, N1)).

restoreState(N):-
	boardState(Cs, Player, Action,Plays, N),
	retract(nextPlayer(_)),
	retract(nextAction(_)),
	retract(remainingPlays(_)),
	assertNext(Plays, Player),
	retractall(position(_,_,_)),
	assert(nextAction(Action)),
	assertBoard(Cs).

	assertNext(2, Player):- asserta(nextPlayer(Player)), asserta(remainingPlays(1)).
	assertNext(1, Player):- opponent(OPlayer, Player), asserta(nextPlayer(OPlayer)), asserta(remainingPlays(2)).

assertBoard([]).
assertBoard([[X,Y,State]|T]):-
	assertz(position(X,Y,State)),
	assertBoard(T).

flagshipCanEscape(X,Y):-
	position(Fx,Fy,flagship),
	( ( emptySpace(Fx,Fy,X,10), Y is 10);
		(emptySpace(Fx,Fy,X,0), Y is 0);
		(emptySpace(Fx,Fy,10,Y), X is 10);
		(emptySpace(Fx,Fy,0,Y), X is 0) ).


sendRemoteBoard(Board):-
	sendRemoteBoard(BoardRR, 10, 10),
	reverse(Board,BoardRR).

sendRemoteBoard([], _,-1):-!.
sendRemoteBoard(Board, X, Y):-
	Y1 is Y-1,
	sendRemoteLine(BoardThis, X, Y),
	reverse(BoardThis, BoardThat),
	sendRemoteBoard(BoardR, X, Y1),
	append([BoardThat], BoardR, Board).

sendRemoteLine([], -1, _):-!.
sendRemoteLine(Line, X, Y):-
 X1 is X-1,
 sendRemoteLine(LineR, X1, Y),
 position(X,Y,Peca),
 tojs(Peca, Code),
 append([Code], LineR, Line).

undoPlay:-
	stateNumber(N),
	N1 is N-1,!,
	restoreState(N1),!,
	printBoard,
	retract(stateNumber(N)),
	assert(stateNumber(N1)).




doRemotePlay(X,Y,Xf,Yf,Player):-
	nextPlayer(Player),
	nextAction(play),!,write(Player),nl,write(play),nl,!,
	doPlay(X,Y,Xf,Yf,Player),!,write('valid play'),nl,
	(captured ->
		retract(nextPlayer(_)),
		retract(captured),
		opponent(Player,Opponent),
		assert(nextPlayer(Opponent)),
		retract(remainingPlays(_)),
		assert(remainingPlays(2));
		retract(remainingPlays(N)),
		N1 is N-1,
		N1 == 0 ->
			retract(nextPlayer(_)),
			opponent(Player,Opponent),
			assert(nextPlayer(Opponent)),
			assert(remainingPlays(2));
			assert(remainingPlays(1))

		).


placeRemotePiece(silverPlayer, X, Y):-
	randomPlacement(silverPlayer, X, Y),
	asserta(position(X,Y,silverPiece)),
	retract(silverPieces(N)),
	N1 is N+1,
	asserta(silverPieces(N1)),
	( N1 == 20 ->
		retractall(nextPlayer(_)),
		asserta(nextPlayer(goldenPlayer)),
		retractall(nextAction(_)),
		assert(nextAction(play)),
		assert(remainingPlays(2));
		true).


		placeRemotePiece(goldenPlayer,X,Y):-
			nextPlayer(goldenPlayer),
			nextAction(place),
				randomPlacement(goldenPlayer,X,Y),
				asserta(position(X,Y,goldenPiece)),
				retract(goldenPieces(N)),
				N1 is N+1,
				asserta(goldenPieces(N1)),
				(N1 == 12 ->
					retract(nextPlayer(_)),
					asserta(nextPlayer(silverPlayer));
					true).





placeRemotePiece(X, Y, silverPlayer):-
	nextPlayer(silverPlayer),
	nextAction(place),
	validateCoordinates(X,Y,silverPlayer),
	asserta(position(X,Y,silverPiece)),
	retract(silverPieces(N)),
	N1 is N+1,
	asserta(silverPieces(N1)),
	( N1 == 20 ->
		retractall(nextPlayer(_)),
		asserta(nextPlayer(goldenPlayer)),
		retractall(nextAction(_)),
		assert(nextAction(play)),
		assert(remainingPlays(2));
		true).

placeRemotePiece(X, Y, goldenPlayer):-
nextPlayer(goldenPlayer),
nextAction(place),
	validateCoordinates(X,Y,goldenPlayer),
	asserta(position(X,Y,goldenPiece)),
	retract(goldenPieces(N)),
	N1 is N+1,
	asserta(goldenPieces(N1)),
	(N1 == 12 ->
		retract(nextPlayer(_)),
		asserta(nextPlayer(silverPlayer));
		true).


wonGameRemote(goldenPlayer):- position(_,0,flagship);position(0,_,flagship);position(10,_,flagship);position(_,10,flagship);\+position(_,_,silverPiece).
wonGameRemote(silverPlayer):- \+position(_,_,flagship).
wonGameRemote(nobody).
