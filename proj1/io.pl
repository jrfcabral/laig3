getInt(X, Value):- repeat,
			write('Value for '), write(Value), write(': '),
			read(X1),
			integer(X1),
			X is X1,
			!.

readCoordinates(X1, Y1):-
 getInt(X1, 'x'),nl,
 getInt(Y1, 'y').

readPlayer(X, Prompt):-
	repeat,
	write(Prompt), nl,
	read(X),
	player(X),!.

clearScreen:-write('\e[2J').

mainMenu:-
write('Welcome to Breakthru!'), nl, nl,
write('What would you like to do: '), nl,
write('1. Play game'), nl,
write('2. Tutorial'), nl,
write('3. Exit'), nl,
repeat,
getInt(Option, 'option'),
(Option = 1, clearScreen, playMenu;
Option = 2, clearScreen, tutorial;
Option = 3).

playMenu:-
write('How would you like to play: '), nl,
write('1. Player vs Player'), nl,
write('2. Player vs Bot'), nl,
write('3. Bot vs Bot'), nl,
repeat,
getInt(Option, 'option'),
(Option = 1, clearScreen, assert(playerGolden(human)), assert(playerSilver(human)), startGame;
Option = 2, clearScreen, chooseSideMenu, startGame;
Option = 3, clearScreen, assert(playerGolden(bot)), botDiffMenu(goldenPlayer), assert(playerSilver(bot)), botDiffMenu(silverPlayer), startGame).

botDiffMenu(Player):-
	write('Choose bot difficulty for '), write(Player), write(': '), nl,
	write('1. Random Mode'), nl,
	write('2. Greedy Mode'), nl,
	repeat,
	getInt(Option, 'option'),
	(Option = 1, clearScreen, assert(difficulty(Player, random));
	Option = 2, clearScreen, assert(difficulty(Player, greedy))).

chooseSideMenu:-
	readPlayer(Player, 'Choose which side you want to be on (silverPlayer. or goldenPlayer.)'),
	(Player = goldenPlayer, assert(playerGolden(human)), assert(playerSilver(bot)), botDiffMenu(silverPlayer);
	Player = silverPlayer, assert(playerSilver(human)), assert(playerGolden(bot)), botDiffMenu(goldenPlayer)).
