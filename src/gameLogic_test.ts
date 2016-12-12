describe("In petMatch", function() {
    const OK = true;
    const ILLEGAL = false;
    const PLAYER0_TURN = 0;
    const PLAYER1_TURN = 1;
    const NO_ONE_TURN = -1;
    const NO_ONE_WINS: number[] = null;
    const PLAYER0_WIN_ENDSCORES = [1, 0];
    const PLAYER1_WIN_ENDSCORES = [0, 1];
    const TIE_ENDSCORES = [0, 0];
    const TOTALSTEPS = gameLogic.PARAMS.TOTALSTEPS;
    let BOARDSAME : Board = 
    [['A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A'],
      ['A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A'],
      ['A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A'],
      ['A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A'],
      ['A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A'],
      ['A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A'],
      ['A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A'],
      ['A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A'],
      ['A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A']];
    let BOARDSHOULDSHUFFLE : Board = 
    [['A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A'],
      ['B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B'],
      ['C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'C'],
      ['D', 'A', 'B', 'C', 'D', 'A', 'B', 'C', 'D'],
      ['A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A'],
      ['B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B'],
      ['C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'C'],
      ['D', 'A', 'B', 'C', 'D', 'A', 'B', 'C', 'D'],
      ['A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A']]
    

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
      changedDeltaAfterMove : BoardDelta[],
      endMatchScores: number[]): void {
      let stateTransition: IStateTransition = {
          turnIndexBeforeMove: turnIndexBeforeMove,
          stateBeforeMove: boardBeforeMove ? {
            board: boardBeforeMove, fromDelta : fromDelta,
            toDelta : toDelta, scores : scoresBeforeMove, 
            completedSteps: completedStepsBeforeMove, 
             changedDelta : changedDeltaAfterMove
            } : null,
              move: { 
                turnIndexAfterMove: turnIndexAfterMove,
                endMatchScores: endMatchScores,
                  stateAfterMove: {
                    board: boardAfterMove,fromDelta : fromDelta,
                     toDelta : toDelta, scores : scoresAfterMove, 
                     completedSteps: completedStepsAfterMove, 
                     changedDelta : changedDeltaAfterMove
                    }
                  },
                  numberOfPlayers: null
    };
    gameLogic.setTestMode(true);
    if (isOk) {
      gameLogic.checkMoveOk(stateTransition);
    } else {
      // We expect an exception to be thrown :)
      let didThrowException = false;
      try {
        gameLogic.checkMoveOk(stateTransition);
      } catch (e) {
          didThrowException = true;
        }
      if (!didThrowException) {
        throw new Error("We expect an illegal move, but checkMoveOk didn't throw any exception!")
      }
    }
  }

  it("Making a move that forms a match of 3 or over 3 is legal", function() {
    expectMove(OK, PLAYER0_TURN,[
      ['A', 'B', 'B', 'C', 'C', 'A', 'A', 'B', 'C'],
      ['C', 'A', 'B', 'B', 'C', 'D', 'D', 'C', 'B'],
      ['A', 'B', 'D', 'C', 'B', 'A', 'A', 'B', 'A'],
      ['C', 'A', 'A', 'D', 'B', 'D', 'D', 'B', 'C'],
      ['D', 'C', 'A', 'C', 'D', 'A', 'B', 'D', 'C'],
      ['D', 'B', 'B', 'A', 'C', 'D', 'A', 'A', 'B'],
      ['A', 'C', 'D', 'D', 'A', 'B', 'B', 'C', 'A'],
      ['D', 'B', 'B', 'A', 'C', 'C', 'A', 'B', 'B'],
      ['A', 'C', 'B', 'C', 'C', 'A', 'A', 'B', 'C']
    ], [0, 0], [0, 0], {row : 0, col : 1}, 
    {row: 1, col : 1}, [
      ['A', 'A', 'A', 'A', 'C', 'A', 'A', 'B', 'C'],
      ['C', 'A', 'B', 'C', 'C', 'D', 'D', 'C', 'B'],
      ['A', 'B', 'D', 'C', 'B', 'A', 'A', 'B', 'A'],
      ['C', 'A', 'A', 'D', 'B', 'D', 'D', 'B', 'C'],
      ['D', 'C', 'A', 'C', 'D', 'A', 'B', 'D', 'C'],
      ['D', 'B', 'B', 'A', 'C', 'D', 'A', 'A', 'B'],
      ['A', 'C', 'D', 'D', 'A', 'B', 'B', 'C', 'A'],
      ['D', 'B', 'B', 'A', 'C', 'C', 'A', 'B', 'B'],
      ['A', 'C', 'B', 'C', 'C', 'A', 'A', 'B', 'C']
    ], PLAYER1_TURN , [30, 0], [1, 0], [
      {row : 1, col : 1},
      {row : 0, col : 1},
      {row : 1, col : 2},
      {row : 0, col : 2},
      {row : 1, col : 3},
      {row : 0, col : 3},
    ], NO_ONE_WINS);
  });

  it("Making a move that forms a match of 3 or over 3 is legal 2", function() {
    expectMove(OK, PLAYER0_TURN,[
      ['A', 'B', 'B', 'C', 'C', 'A', 'A', 'B', 'C'],
      ['C', 'A', 'B', 'B', 'C', 'D', 'D', 'C', 'B'],
      ['A', 'B', 'D', 'C', 'B', 'A', 'A', 'B', 'A'],
      ['C', 'A', 'A', 'D', 'B', 'D', 'D', 'B', 'C'],
      ['D', 'C', 'A', 'C', 'D', 'A', 'B', 'D', 'C'],
      ['D', 'B', 'B', 'A', 'C', 'D', 'A', 'A', 'B'],
      ['A', 'C', 'D', 'D', 'A', 'B', 'B', 'C', 'A'],
      ['D', 'B', 'B', 'A', 'C', 'C', 'A', 'B', 'B'],
      ['A', 'C', 'B', 'C', 'C', 'A', 'A', 'B', 'C']
    ] , [0, 0], [0, 0], {row : 0, col : 1}, 
    {row: 1, col : 1}, [
      ['A', 'A', 'A', 'A', 'C', 'A', 'A', 'B', 'C'],
      ['C', 'A', 'B', 'C', 'C', 'D', 'D', 'C', 'B'],
      ['A', 'B', 'D', 'C', 'B', 'A', 'A', 'B', 'A'],
      ['C', 'A', 'A', 'D', 'B', 'D', 'D', 'B', 'C'],
      ['D', 'C', 'A', 'C', 'D', 'A', 'B', 'D', 'C'],
      ['D', 'B', 'B', 'A', 'C', 'D', 'A', 'A', 'B'],
      ['A', 'C', 'D', 'D', 'A', 'B', 'B', 'C', 'A'],
      ['D', 'B', 'B', 'A', 'C', 'C', 'A', 'B', 'B'],
      ['A', 'C', 'B', 'C', 'C', 'A', 'A', 'B', 'C']
    ], PLAYER1_TURN , [30, 0], [1, 0], [
      {row : 1, col : 1},
      {row : 0, col : 1},
      {row : 1, col : 2},
      {row : 0, col : 2},
      {row : 1, col : 3},
      {row : 0, col : 3},
    ], NO_ONE_WINS);
  });

  

  it("Making a move that cannot form a match of 3 or over 3 is illegal", function() {
    expectMove(!OK, PLAYER0_TURN,[
      ['A', 'B', 'B', 'C', 'C', 'A', 'A', 'B', 'C'],
      ['C', 'A', 'B', 'B', 'C', 'D', 'D', 'C', 'B'],
      ['A', 'B', 'D', 'C', 'B', 'A', 'A', 'B', 'A'],
      ['C', 'A', 'A', 'D', 'B', 'D', 'D', 'B', 'C'],
      ['D', 'C', 'A', 'C', 'D', 'A', 'B', 'D', 'C'],
      ['D', 'B', 'B', 'A', 'C', 'D', 'A', 'A', 'B'],
      ['A', 'C', 'D', 'D', 'A', 'B', 'B', 'C', 'A'],
      ['D', 'B', 'B', 'A', 'C', 'C', 'A', 'B', 'B'],
      ['A', 'C', 'B', 'C', 'C', 'A', 'A', 'B', 'C']
    ], [0, 0], [0, 0], {row : 0, col : 0}, 
    {row: 0, col : 1}, null
      , PLAYER1_TURN , [0, 0], [1, 0],null, NO_ONE_WINS);
  });

  it("Making a move that forms a match of 3 or over 3 is legal && should shuffle", function() {
    expectMove(!OK, PLAYER0_TURN,BOARDSHOULDSHUFFLE, [0, 0], [0, 0], {row : 0, col : 1}, 
    {row: 1, col : 1}, null
      , PLAYER1_TURN , [250, 0], [1, 0],null, NO_ONE_WINS);
  });
  
  it("Making a move that leads to tie is legal", function() {
    expectMove(OK, PLAYER0_TURN,[
      ['A', 'B', 'B', 'C', 'C', 'A', 'A', 'B', 'C'],
      ['C', 'A', 'B', 'B', 'C', 'D', 'D', 'C', 'B'],
      ['A', 'B', 'D', 'C', 'B', 'A', 'A', 'B', 'A'],
      ['C', 'A', 'A', 'D', 'B', 'D', 'D', 'B', 'C'],
      ['D', 'C', 'A', 'C', 'D', 'A', 'B', 'D', 'C'],
      ['D', 'B', 'B', 'A', 'C', 'D', 'A', 'A', 'B'],
      ['A', 'C', 'D', 'D', 'A', 'B', 'B', 'C', 'A'],
      ['D', 'B', 'B', 'A', 'C', 'C', 'A', 'B', 'B'],
      ['A', 'C', 'B', 'C', 'C', 'A', 'A', 'B', 'C']
    ], [0, 30], [TOTALSTEPS - 1, TOTALSTEPS], {row : 0, col : 1}, 
    {row: 1, col : 1}, [
      ['A', 'A', 'A', 'A', 'C', 'A', 'A', 'B', 'C'],
      ['C', 'A', 'B', 'C', 'C', 'D', 'D', 'C', 'B'],
      ['A', 'B', 'D', 'C', 'B', 'A', 'A', 'B', 'A'],
      ['C', 'A', 'A', 'D', 'B', 'D', 'D', 'B', 'C'],
      ['D', 'C', 'A', 'C', 'D', 'A', 'B', 'D', 'C'],
      ['D', 'B', 'B', 'A', 'C', 'D', 'A', 'A', 'B'],
      ['A', 'C', 'D', 'D', 'A', 'B', 'B', 'C', 'A'],
      ['D', 'B', 'B', 'A', 'C', 'C', 'A', 'B', 'B'],
      ['A', 'C', 'B', 'C', 'C', 'A', 'A', 'B', 'C']
    ], NO_ONE_TURN , [30, 30], [TOTALSTEPS, TOTALSTEPS], [
      {row : 1, col : 1},
      {row : 0, col : 1},
      {row : 1, col : 2},
      {row : 0, col : 2},
      {row : 1, col : 3},
      {row : 0, col : 3},
    ], TIE_ENDSCORES);
  });

  it("Making a move that leads to a winner is legal", function() {
    expectMove(OK, PLAYER0_TURN, [
      ['A', 'B', 'B', 'C', 'C', 'A', 'A', 'B', 'C'],
      ['C', 'A', 'B', 'B', 'C', 'D', 'D', 'C', 'B'],
      ['A', 'B', 'D', 'C', 'B', 'A', 'A', 'B', 'A'],
      ['C', 'A', 'A', 'D', 'B', 'D', 'D', 'B', 'C'],
      ['D', 'C', 'A', 'C', 'D', 'A', 'B', 'D', 'C'],
      ['D', 'B', 'B', 'A', 'C', 'D', 'A', 'A', 'B'],
      ['A', 'C', 'D', 'D', 'A', 'B', 'B', 'C', 'A'],
      ['D', 'B', 'B', 'A', 'C', 'C', 'A', 'B', 'B'],
      ['A', 'C', 'B', 'C', 'C', 'A', 'A', 'B', 'C']
    ], [30, 30], [TOTALSTEPS - 1, TOTALSTEPS], {row : 0, col : 1}, 
    {row: 1, col : 1}, [
      ['A', 'A', 'A', 'A', 'C', 'A', 'A', 'B', 'C'],
      ['C', 'A', 'B', 'C', 'C', 'D', 'D', 'C', 'B'],
      ['A', 'B', 'D', 'C', 'B', 'A', 'A', 'B', 'A'],
      ['C', 'A', 'A', 'D', 'B', 'D', 'D', 'B', 'C'],
      ['D', 'C', 'A', 'C', 'D', 'A', 'B', 'D', 'C'],
      ['D', 'B', 'B', 'A', 'C', 'D', 'A', 'A', 'B'],
      ['A', 'C', 'D', 'D', 'A', 'B', 'B', 'C', 'A'],
      ['D', 'B', 'B', 'A', 'C', 'C', 'A', 'B', 'B'],
      ['A', 'C', 'B', 'C', 'C', 'A', 'A', 'B', 'C']
    ], NO_ONE_TURN , [60, 30], [TOTALSTEPS, TOTALSTEPS],[
      {row : 1, col : 1},
      {row : 0, col : 1},
      {row : 1, col : 2},
      {row : 0, col : 2},
      {row : 1, col : 3},
      {row : 0, col : 3},
    ], PLAYER0_WIN_ENDSCORES);
  });

it("Making a move when game is over is illegal", function() {
    expectMove(!OK, PLAYER0_TURN,[
      ['A', 'B', 'B', 'C', 'C', 'A', 'A', 'B', 'C'],
      ['C', 'A', 'B', 'B', 'C', 'D', 'D', 'C', 'B'],
      ['A', 'B', 'D', 'C', 'B', 'A', 'A', 'B', 'A'],
      ['C', 'A', 'A', 'D', 'B', 'D', 'D', 'B', 'C'],
      ['D', 'C', 'A', 'C', 'D', 'A', 'B', 'D', 'C'],
      ['D', 'B', 'B', 'A', 'C', 'D', 'A', 'A', 'B'],
      ['A', 'C', 'D', 'D', 'A', 'B', 'B', 'C', 'A'],
      ['D', 'B', 'B', 'A', 'C', 'C', 'A', 'B', 'B'],
      ['A', 'C', 'B', 'C', 'C', 'A', 'A', 'B', 'C']
    ], [0, 30], [TOTALSTEPS, TOTALSTEPS], {row : 0, col : 1}, 
    {row: 1, col : 1}, [
      ['A', 'B', 'B', 'C', 'C', 'A', 'A', 'B', 'C'],
      ['C', 'A', 'B', 'B', 'C', 'D', 'D', 'C', 'B'],
      ['A', 'B', 'D', 'C', 'B', 'A', 'A', 'B', 'A'],
      ['C', 'A', 'A', 'D', 'B', 'D', 'D', 'B', 'C'],
      ['D', 'C', 'A', 'C', 'D', 'A', 'B', 'D', 'C'],
      ['D', 'B', 'B', 'A', 'C', 'D', 'A', 'A', 'B'],
      ['A', 'C', 'D', 'D', 'A', 'B', 'B', 'C', 'A'],
      ['D', 'B', 'B', 'A', 'C', 'C', 'A', 'B', 'B'],
      ['A', 'C', 'B', 'C', 'C', 'A', 'A', 'B', 'C']
    ], NO_ONE_TURN , [30, 30], [TOTALSTEPS, TOTALSTEPS],null, TIE_ENDSCORES);
  });

});