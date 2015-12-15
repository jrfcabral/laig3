randomMove(CurrPlayer, Pred):-
findall([Xi,Yi,Xf,Yf], validMove(Xi,Yi,Xf,Yf,CurrPlayer), Possiveis),
length(Possiveis, N),
random(0, N, NList),
nth0(NList, Possiveis, ChosenPlay),
append(ChosenPlay, [CurrPlayer], AlmostPred),
append([doPlay], AlmostPred, Pred).

randomPlay(CurrPlayer, Pred):-
findall([Xi,Yi,Xf,Yf], validPlay(Xi,Yi,Xf,Yf,CurrPlayer), Possiveis),
length(Possiveis, N),
random(0, N, NList),
nth0(NList, Possiveis, ChosenPlay),
append(ChosenPlay, [CurrPlayer], AlmostPred),
append([doPlay], AlmostPred, Pred).

randomPlacement(CurrPlayer, X,Y):-
	findall([Xp, Yp], possiblePlace(CurrPlayer, Xp, Yp), Possiveis),
	length(Possiveis, N),
	random(0, N, NList),
	nth0(NList, Possiveis, [X,Y]).

blockFlagship(X,Y,Xj,Yj):-
  position(Xf,Yf,flagship),
  flagshipCanEscape(Xe,Ye),
  ((Xe = Xf, Ye > Yf, validMove(X,Y,Xe, Yj,silverPlayer), Yj > Yf, Xj is Xe ); %escapa para baixo
  (Xe = Xf, Ye < Yf, validMove(X,Y,Xe, Yj,silverPlayer), Yj < Yf, Xj is Xe ); %escapa para cima
  (Ye = Yf, Xe > Xf, validMove(X,Y,Xj, Ye,silverPlayer), Xj > Xf, Yj is Ye ); %escapa para a direita
  (Ye = Yf, Xe < Xf, validMove(X,Y,Xj, Ye,silverPlayer), Xj < Xf, Yj is Ye )). %escapa para a esquerda

blockFlagshipPlacement:-
  position(Xf,Yf,flagship),
  flagshipCanEscape(Xe,Ye),
  ((Xe = Xf, Ye > Yf, asserta(position(Xe,10,silverPiece))); %escapa para baixo
  (Xe = Xf, Ye < Yf, asserta(position(Xe,0,silverPiece))); %escapa para cima
  (Ye = Yf, Xe > Xf, asserta(position(10,Ye,silverPiece))); %escapa para a direita
  (Ye = Yf, Xe < Xf, asserta(position(0,Ye,silverPiece)))). %escapa para a esquerda
