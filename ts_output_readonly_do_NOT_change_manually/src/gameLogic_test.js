describe("In petMatch", function () {
    var OK = true;
    var ILLEGAL = false;
    var PLAYER0_TURN = 0;
    var PLAYER1_TURN = 1;
    var NO_ONE_TURN = -1;
    var NO_ONE_WINS = null;
    var PLAYER0_WIN_ENDSCORES = [1, 0];
    var PLAYER1_WIN_ENDSCORES = [0, 1];
    var TIE_ENDSCORES = [0, 0];
    var TOTALSTEPS = gameLogic.PARAMS.TOTALSTEPS;
    var BOARDSAME = [['A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A'],
        ['A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A'],
        ['A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A'],
        ['A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A'],
        ['A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A'],
        ['A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A'],
        ['A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A'],
        ['A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A'],
        ['A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A']];
    var BOARDSHOULDSHUFFLE = [['A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A'],
        ['B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B'],
        ['C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'C'],
        ['D', 'A', 'B', 'C', 'D', 'A', 'B', 'C', 'D'],
        ['A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A'],
        ['B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B'],
        ['C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'C'],
        ['D', 'A', 'B', 'C', 'D', 'A', 'B', 'C', 'D'],
        ['A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A']];
    function expectMove(isOk, turnIndexBeforeMove, boardBeforeMove, scoresBeforeMove, completedStepsBeforeMove, fromDelta, toDelta, boardAfterMove, turnIndexAfterMove, scoresAfterMove, completedStepsAfterMove, changedDeltaAfterMove, endMatchScores) {
        var stateTransition = {
            turnIndexBeforeMove: turnIndexBeforeMove,
            stateBeforeMove: boardBeforeMove ? {
                board: boardBeforeMove, fromDelta: fromDelta,
                toDelta: toDelta, scores: scoresBeforeMove,
                completedSteps: completedStepsBeforeMove,
                changedDelta: changedDeltaAfterMove
            } : null,
            move: {
                turnIndexAfterMove: turnIndexAfterMove,
                endMatchScores: endMatchScores,
                stateAfterMove: {
                    board: boardAfterMove, fromDelta: fromDelta,
                    toDelta: toDelta, scores: scoresAfterMove,
                    completedSteps: completedStepsAfterMove,
                    changedDelta: changedDeltaAfterMove
                }
            },
            numberOfPlayers: null
        };
        gameLogic.setTestMode(true);
        if (isOk) {
            gameLogic.checkMoveOk(stateTransition);
        }
        else {
            // We expect an exception to be thrown :)
            var didThrowException = false;
            try {
                gameLogic.checkMoveOk(stateTransition);
            }
            catch (e) {
                didThrowException = true;
            }
            if (!didThrowException) {
                throw new Error("We expect an illegal move, but checkMoveOk didn't throw any exception!");
            }
        }
    }
    it("Making a move that forms a match of 3 or over 3 is legal", function () {
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
        ], [0, 0], [0, 0], { row: 0, col: 1 }, { row: 1, col: 1 }, [
            ['A', 'A', 'A', 'A', 'C', 'A', 'A', 'B', 'C'],
            ['C', 'A', 'B', 'C', 'C', 'D', 'D', 'C', 'B'],
            ['A', 'B', 'D', 'C', 'B', 'A', 'A', 'B', 'A'],
            ['C', 'A', 'A', 'D', 'B', 'D', 'D', 'B', 'C'],
            ['D', 'C', 'A', 'C', 'D', 'A', 'B', 'D', 'C'],
            ['D', 'B', 'B', 'A', 'C', 'D', 'A', 'A', 'B'],
            ['A', 'C', 'D', 'D', 'A', 'B', 'B', 'C', 'A'],
            ['D', 'B', 'B', 'A', 'C', 'C', 'A', 'B', 'B'],
            ['A', 'C', 'B', 'C', 'C', 'A', 'A', 'B', 'C']
        ], PLAYER1_TURN, [30, 0], [1, 0], [
            { row: 1, col: 1 },
            { row: 0, col: 1 },
            { row: 1, col: 2 },
            { row: 0, col: 2 },
            { row: 1, col: 3 },
            { row: 0, col: 3 },
        ], NO_ONE_WINS);
    });
    it("Making a move that forms a match of 3 or over 3 is legal 2", function () {
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
        ], [0, 0], [0, 0], { row: 0, col: 1 }, { row: 1, col: 1 }, [
            ['A', 'A', 'A', 'A', 'C', 'A', 'A', 'B', 'C'],
            ['C', 'A', 'B', 'C', 'C', 'D', 'D', 'C', 'B'],
            ['A', 'B', 'D', 'C', 'B', 'A', 'A', 'B', 'A'],
            ['C', 'A', 'A', 'D', 'B', 'D', 'D', 'B', 'C'],
            ['D', 'C', 'A', 'C', 'D', 'A', 'B', 'D', 'C'],
            ['D', 'B', 'B', 'A', 'C', 'D', 'A', 'A', 'B'],
            ['A', 'C', 'D', 'D', 'A', 'B', 'B', 'C', 'A'],
            ['D', 'B', 'B', 'A', 'C', 'C', 'A', 'B', 'B'],
            ['A', 'C', 'B', 'C', 'C', 'A', 'A', 'B', 'C']
        ], PLAYER1_TURN, [30, 0], [1, 0], [
            { row: 1, col: 1 },
            { row: 0, col: 1 },
            { row: 1, col: 2 },
            { row: 0, col: 2 },
            { row: 1, col: 3 },
            { row: 0, col: 3 },
        ], NO_ONE_WINS);
    });
    it("Making a move that cannot form a match of 3 or over 3 is illegal", function () {
        expectMove(!OK, PLAYER0_TURN, [
            ['A', 'B', 'B', 'C', 'C', 'A', 'A', 'B', 'C'],
            ['C', 'A', 'B', 'B', 'C', 'D', 'D', 'C', 'B'],
            ['A', 'B', 'D', 'C', 'B', 'A', 'A', 'B', 'A'],
            ['C', 'A', 'A', 'D', 'B', 'D', 'D', 'B', 'C'],
            ['D', 'C', 'A', 'C', 'D', 'A', 'B', 'D', 'C'],
            ['D', 'B', 'B', 'A', 'C', 'D', 'A', 'A', 'B'],
            ['A', 'C', 'D', 'D', 'A', 'B', 'B', 'C', 'A'],
            ['D', 'B', 'B', 'A', 'C', 'C', 'A', 'B', 'B'],
            ['A', 'C', 'B', 'C', 'C', 'A', 'A', 'B', 'C']
        ], [0, 0], [0, 0], { row: 0, col: 0 }, { row: 0, col: 1 }, null, PLAYER1_TURN, [0, 0], [1, 0], null, NO_ONE_WINS);
    });
    it("Making a move that forms a match of 3 or over 3 is legal && should shuffle", function () {
        expectMove(!OK, PLAYER0_TURN, BOARDSHOULDSHUFFLE, [0, 0], [0, 0], { row: 0, col: 1 }, { row: 1, col: 1 }, null, PLAYER1_TURN, [250, 0], [1, 0], null, NO_ONE_WINS);
    });
    it("Making a move that leads to tie is legal", function () {
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
        ], [0, 30], [TOTALSTEPS - 1, TOTALSTEPS], { row: 0, col: 1 }, { row: 1, col: 1 }, [
            ['A', 'A', 'A', 'A', 'C', 'A', 'A', 'B', 'C'],
            ['C', 'A', 'B', 'C', 'C', 'D', 'D', 'C', 'B'],
            ['A', 'B', 'D', 'C', 'B', 'A', 'A', 'B', 'A'],
            ['C', 'A', 'A', 'D', 'B', 'D', 'D', 'B', 'C'],
            ['D', 'C', 'A', 'C', 'D', 'A', 'B', 'D', 'C'],
            ['D', 'B', 'B', 'A', 'C', 'D', 'A', 'A', 'B'],
            ['A', 'C', 'D', 'D', 'A', 'B', 'B', 'C', 'A'],
            ['D', 'B', 'B', 'A', 'C', 'C', 'A', 'B', 'B'],
            ['A', 'C', 'B', 'C', 'C', 'A', 'A', 'B', 'C']
        ], NO_ONE_TURN, [30, 30], [TOTALSTEPS, TOTALSTEPS], [
            { row: 1, col: 1 },
            { row: 0, col: 1 },
            { row: 1, col: 2 },
            { row: 0, col: 2 },
            { row: 1, col: 3 },
            { row: 0, col: 3 },
        ], TIE_ENDSCORES);
    });
    it("Making a move that leads to a winner is legal", function () {
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
        ], [30, 30], [TOTALSTEPS - 1, TOTALSTEPS], { row: 0, col: 1 }, { row: 1, col: 1 }, [
            ['A', 'A', 'A', 'A', 'C', 'A', 'A', 'B', 'C'],
            ['C', 'A', 'B', 'C', 'C', 'D', 'D', 'C', 'B'],
            ['A', 'B', 'D', 'C', 'B', 'A', 'A', 'B', 'A'],
            ['C', 'A', 'A', 'D', 'B', 'D', 'D', 'B', 'C'],
            ['D', 'C', 'A', 'C', 'D', 'A', 'B', 'D', 'C'],
            ['D', 'B', 'B', 'A', 'C', 'D', 'A', 'A', 'B'],
            ['A', 'C', 'D', 'D', 'A', 'B', 'B', 'C', 'A'],
            ['D', 'B', 'B', 'A', 'C', 'C', 'A', 'B', 'B'],
            ['A', 'C', 'B', 'C', 'C', 'A', 'A', 'B', 'C']
        ], NO_ONE_TURN, [60, 30], [TOTALSTEPS, TOTALSTEPS], [
            { row: 1, col: 1 },
            { row: 0, col: 1 },
            { row: 1, col: 2 },
            { row: 0, col: 2 },
            { row: 1, col: 3 },
            { row: 0, col: 3 },
        ], PLAYER0_WIN_ENDSCORES);
    });
    it("Making a move when game is over is illegal", function () {
        expectMove(!OK, PLAYER0_TURN, [
            ['A', 'B', 'B', 'C', 'C', 'A', 'A', 'B', 'C'],
            ['C', 'A', 'B', 'B', 'C', 'D', 'D', 'C', 'B'],
            ['A', 'B', 'D', 'C', 'B', 'A', 'A', 'B', 'A'],
            ['C', 'A', 'A', 'D', 'B', 'D', 'D', 'B', 'C'],
            ['D', 'C', 'A', 'C', 'D', 'A', 'B', 'D', 'C'],
            ['D', 'B', 'B', 'A', 'C', 'D', 'A', 'A', 'B'],
            ['A', 'C', 'D', 'D', 'A', 'B', 'B', 'C', 'A'],
            ['D', 'B', 'B', 'A', 'C', 'C', 'A', 'B', 'B'],
            ['A', 'C', 'B', 'C', 'C', 'A', 'A', 'B', 'C']
        ], [0, 30], [TOTALSTEPS, TOTALSTEPS], { row: 0, col: 1 }, { row: 1, col: 1 }, [
            ['A', 'B', 'B', 'C', 'C', 'A', 'A', 'B', 'C'],
            ['C', 'A', 'B', 'B', 'C', 'D', 'D', 'C', 'B'],
            ['A', 'B', 'D', 'C', 'B', 'A', 'A', 'B', 'A'],
            ['C', 'A', 'A', 'D', 'B', 'D', 'D', 'B', 'C'],
            ['D', 'C', 'A', 'C', 'D', 'A', 'B', 'D', 'C'],
            ['D', 'B', 'B', 'A', 'C', 'D', 'A', 'A', 'B'],
            ['A', 'C', 'D', 'D', 'A', 'B', 'B', 'C', 'A'],
            ['D', 'B', 'B', 'A', 'C', 'C', 'A', 'B', 'B'],
            ['A', 'C', 'B', 'C', 'C', 'A', 'A', 'B', 'C']
        ], NO_ONE_TURN, [30, 30], [TOTALSTEPS, TOTALSTEPS], null, TIE_ENDSCORES);
    });
});
//# sourceMappingURL=gameLogic_test.js.map