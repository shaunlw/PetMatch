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
    
    function expectStateTransition(
      isOk: boolean, stateTransition: IStateTransition) {
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
    function expectMove(
        mode : number,
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
      if (mode === 1) {
        gameLogic.setTestMode(true);
      }
      if (mode === 0) {
        gameLogic.setTestMode(false);
      }
      expectStateTransition(isOk, stateTransition);
    }

    it("Initial state", function() {
      expectStateTransition(!OK, {
        turnIndexBeforeMove: PLAYER0_TURN,
        stateBeforeMove: null,
        move: {
          turnIndexAfterMove: PLAYER1_TURN,
          endMatchScores: NO_ONE_WINS,
          stateAfterMove: null
        },
        numberOfPlayers: null
      });
    });

    it("Making a move that forms a match of 3 or over 3 is legal", function() {
      expectMove(1, OK, PLAYER0_TURN,[
        ['A', 'B', 'B', 'C', 'C', 'A', 'A', 'B', 'C'],
        ['C', 'A', 'B', 'B', 'C', 'D', 'D', 'C', 'B'],
        ['A', 'B', 'D', 'C', 'B', 'A', 'A', 'B', 'C'],
        ['C', 'A', 'A', 'D', 'B', 'D', 'D', 'B', 'A'],
        ['D', 'C', 'A', 'C', 'D', 'A', 'B', 'D', 'C'],
        ['D', 'B', 'B', 'A', 'C', 'D', 'A', 'A', 'D'],
        ['A', 'C', 'D', 'D', 'A', 'B', 'B', 'A', 'C'],
        ['D', 'B', 'B', 'C', 'C', 'C', 'A', 'C', 'A'],
        ['A', 'C', 'B', 'C', 'C', 'A', 'A', 'B', 'C']
      ], [0, 0], [0, 0], {row : 0, col : 1}, 
      {row: 1, col : 1}, [
        ['A', 'A', 'A', 'A', 'C', 'A', 'A', 'B', 'C'],
        ['C', 'A', 'B', 'C', 'C', 'D', 'D', 'C', 'B'],
        ['A', 'B', 'D', 'C', 'B', 'A', 'A', 'B', 'C'],
        ['C', 'A', 'A', 'D', 'B', 'D', 'D', 'B', 'A'],
        ['D', 'C', 'A', 'C', 'D', 'A', 'B', 'D', 'C'],
        ['D', 'B', 'B', 'A', 'C', 'D', 'A', 'A', 'D'],
        ['A', 'C', 'D', 'D', 'A', 'B', 'B', 'A', 'C'],
        ['D', 'B', 'B', 'C', 'C', 'C', 'A', 'C', 'A'],
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

    it("Making a move that swap non-adjacent pets are illegal", function() {
      expectMove(1, !OK, PLAYER0_TURN,[
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
      {row: 2, col : 1}, null, PLAYER1_TURN , [0, 0], [0, 0], null, NO_ONE_WINS);
    });

    it("Expected move and move not matching", function() {
      expectMove(0, !OK, PLAYER0_TURN,gameLogic.getInitialBoard(), [0, 0], [0, 0], {row : 0, col : 1}, 
      {row: 1, col : 1}, null, PLAYER1_TURN , [0, 0], [0, 0], null, NO_ONE_WINS);
    });

    it("Making a move that has null fromDelta is illegal", function() {
      expectMove(1, !OK, PLAYER0_TURN,[
        ['A', 'B', 'B', 'C', 'C', 'A', 'A', 'B', 'C'],
        ['C', 'A', 'B', 'B', 'C', 'D', 'D', 'C', 'B'],
        ['A', 'B', 'D', 'C', 'B', 'A', 'A', 'B', 'A'],
        ['C', 'A', 'A', 'D', 'B', 'D', 'D', 'B', 'C'],
        ['D', 'C', 'A', 'C', 'D', 'A', 'B', 'D', 'C'],
        ['D', 'B', 'B', 'A', 'C', 'D', 'A', 'A', 'B'],
        ['A', 'C', 'D', 'D', 'A', 'B', 'B', 'C', 'A'],
        ['D', 'B', 'B', 'A', 'C', 'C', 'A', 'B', 'B'],
        ['A', 'C', 'B', 'C', 'C', 'A', 'A', 'B', 'C']
      ], [0, 0], [0, 0], null, 
      {row: 2, col : 1}, null, PLAYER1_TURN , [0, 0], [0, 0], null, NO_ONE_WINS);
    });

    it("Making a move that has null toDelta is illegal", function() {
      expectMove(1, !OK, PLAYER0_TURN,[
        ['A', 'B', 'B', 'C', 'C', 'A', 'A', 'B', 'C'],
        ['C', 'A', 'B', 'B', 'C', 'D', 'D', 'C', 'B'],
        ['A', 'B', 'D', 'C', 'B', 'A', 'A', 'B', 'A'],
        ['C', 'A', 'A', 'D', 'B', 'D', 'D', 'B', 'C'],
        ['D', 'C', 'A', 'C', 'D', 'A', 'B', 'D', 'C'],
        ['D', 'B', 'B', 'A', 'C', 'D', 'A', 'A', 'B'],
        ['A', 'C', 'D', 'D', 'A', 'B', 'B', 'C', 'A'],
        ['D', 'B', 'B', 'A', 'C', 'C', 'A', 'B', 'B'],
        ['A', 'C', 'B', 'C', 'C', 'A', 'A', 'B', 'C']
      ], [0, 0], [0, 0], {row: 0, col : 1}, 
      null, null, PLAYER1_TURN , [0, 0], [0, 0], null, NO_ONE_WINS);
    });

    

    it("Making a move that cannot form a match of 3 or over 3 is illegal", function() {
      expectMove(1, !OK, PLAYER0_TURN,[
        ['A', 'B', 'B', 'C', 'C', 'A', 'A', 'B', 'C'],
        ['C', 'A', 'B', 'B', 'C', 'D', 'D', 'C', 'B'],
        ['A', 'B', 'D', 'C', 'B', 'A', 'A', 'B', 'A'],
        ['C', 'A', 'A', 'D', 'B', 'D', 'D', 'B', 'C'],
        ['D', 'C', 'A', 'C', 'D', 'A', 'B', 'D', 'C'],
        ['D', 'B', 'B', 'A', 'C', 'D', 'A', 'A', 'B'],
        ['A', 'C', 'D', 'D', 'A', 'B', 'B', 'C', 'A'],
        ['D', 'B', 'B', 'A', 'C', 'C', 'A', 'B', 'B'],
        ['A', 'C', 'B', 'C', 'C', 'A', 'A', 'B', 'C']
      ], [0, 0], [0, 0], {row : 0, col : 0}, {row: 0, col : 1}, null
        , PLAYER1_TURN , [0, 0], [1, 0],null, NO_ONE_WINS);
      });

    it("Expected move doesn't match move", function() {
      expectMove(1, OK, PLAYER0_TURN,gameLogic.getInitialBoard(), [0, 0], [0, 0], {row : 0, col : 1}, 
      {row: 1, col : 1}, BOARDSAME, PLAYER1_TURN , [250, 0], [1, 0],[
  	      {"row": 0, "col": 0}, {"row": 0,"col": 1}, {"row": 0,"col": 2}, {"row": 0,"col": 3},
  	      {"row": 0, "col": 4}, {"row": 0,"col": 5}, {"row": 0,"col": 6}, {"row": 0,"col": 7},
  	      {"row": 0, "col": 8}, {"row": 8,"col": 1}, {"row": 7,"col": 1}, {"row": 6,"col": 1},
  	      {"row": 5, "col": 1}, {"row": 4,"col": 1}, {"row": 3,"col": 1}, {"row": 2,"col": 1},
  	      {"row": 1, "col": 1}, {"row": 1,"col": 0}, {"row": 1,"col": 2}, {"row": 1,"col": 3},
  	      {"row": 1, "col": 4}, {"row": 1, "col": 5}, {"row": 1, "col": 6}, {"row": 1, "col": 7},
  	      {"row": 1, "col": 8}], NO_ONE_WINS);
    });
    
    it("Making a move that leads to tie is legal", function() {
      expectMove(1, OK, PLAYER0_TURN,[
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
      expectMove(1, OK, PLAYER0_TURN, [
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
      expectMove(1, !OK, PLAYER0_TURN,[
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