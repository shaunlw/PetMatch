describe("In petMatch", function() {
    let OK = true;
    let ILLEGAL = false;
    let PLAYER0_TURN = 0;
    let PLAYER1_TURN = 1;
    let NO_ONE_TURN = -1;
    let NO_ONE_WINS: number[] = null;
    let PLAYER0_WIN_ENDSCORES = [1, 0];
    let PLAYER1_WIN_ENDSCORES = [0, 1];
    let TIE_ENDSCORES = [0, 0];
    let INITIALBOARD : Board = 
    [['A', 'B', 'B', 'C', 'C', 'A', 'A', 'B', 'C'],
      ['C', 'A', 'B', 'B', 'C', 'D', 'D', 'C', 'B'],
      ['A', 'B', 'D', 'C', 'B', 'A', 'A', 'B', 'A'],
      ['C', 'A', 'A', 'D', 'B', 'D', 'D', 'B', 'C'],
      ['D', 'C', 'A', 'C', 'D', 'A', 'B', 'D', 'C'],
      ['D', 'B', 'B', 'A', 'C', 'D', 'A', 'A', 'B'],
      ['A', 'C', 'D', 'D', 'A', 'B', 'B', 'C', 'A'],
      ['D', 'B', 'B', 'A', 'C', 'C', 'A', 'B', 'B'],
      ['A', 'C', 'B', 'C', 'C', 'A', 'A', 'B', 'C']];

  function expectMove(
      isOk: boolean,
      turnIndexBeforeMove: number,
      boardBeforeMove: Board,
      scoresBeforeMove: number[],
      completedStepsBeforeMove : number[],
      fromDelta : BoardDelta,
      toDelta : BoardDelta,
      boardAfterMove: Board,
      turnIndexAfterMove: number,
      scoresAfterMove: number[],
      completedStepsAfterMove : number[],
      boardCountAfterMove : BoardCount,
      endMatchScores: number[]): void {
      let stateTransition: IStateTransition = {
          turnIndexBeforeMove: turnIndexBeforeMove,
          stateBeforeMove: boardBeforeMove ? {board: boardBeforeMove, fromDelta : fromDelta, toDelta : toDelta, 
              scores : scoresBeforeMove, completedSteps: completedStepsBeforeMove, boardCount : null} : null,
              move: {
                  turnIndexAfterMove: turnIndexAfterMove,
                  endMatchScores: endMatchScores,
                  stateAfterMove: {board: boardAfterMove,fromDelta : fromDelta, toDelta : toDelta, 
                      scores : scoresAfterMove, completedSteps: completedStepsAfterMove, boardCount : boardCountAfterMove}
                    },
                    numberOfPlayers: null
                };
    if (isOk) {
      boardCountAfterMove = gameLogic.updateBoard(boardBeforeMove, fromDelta, toDelta);
      gameLogic.checkMoveOk(stateTransition);
    } else {
      // We expect an exception to be thrown :)
      let didThrowException = false;
      try {
        gameLogic.updateBoard(boardBeforeMove, fromDelta, toDelta);
        try {
        gameLogic.checkMoveOk(stateTransition);
      } catch (e) {
        didThrowException = true;
      }
      } catch (e) {
        didThrowException = true;
      }
      
      if (!didThrowException) {
        throw new Error("We expect an illegal move, but checkMoveOk didn't throw any exception!")
      }
    }
  }

  it("Making a move that cannot form a match of 3 or over 3 is illegal", function() {
    expectMove(!OK, PLAYER0_TURN,INITIALBOARD, [0, 0], [0, 0], {row : 0, col : 0}, 
    {row: 0, col : 1}, INITIALBOARD
      , PLAYER1_TURN , [0, 0], [1, 0],null, NO_ONE_WINS);
  });



});