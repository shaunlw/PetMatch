var gameLogic;
(function (gameLogic) {
    gameLogic.PARAMS = {
        ROWS: 9,
        COLS: 9,
        TOTALSTEPS: 30
    };
    var NUM_PLAYERS = 2;
    /**
     * @ Return the initial PetMatch board.
     *   a ROWSxCOLS matrix containing four types of pets.
     **/
    function getInitialBoard() {
        var board = [
            ['A', 'B', 'B', 'C', 'C', 'A', 'A', 'B', 'C'],
            ['C', 'A', 'B', 'B', 'C', 'D', 'D', 'C', 'B'],
            ['A', 'B', 'D', 'C', 'B', 'A', 'A', 'B', 'A'],
            ['C', 'A', 'A', 'D', 'B', 'D', 'D', 'B', 'C'],
            ['D', 'C', 'A', 'C', 'D', 'A', 'B', 'D', 'C'],
            ['D', 'B', 'B', 'A', 'C', 'D', 'A', 'A', 'B'],
            ['A', 'C', 'D', 'D', 'A', 'B', 'B', 'C', 'A'],
            ['D', 'B', 'B', 'A', 'C', 'C', 'A', 'B', 'B'],
            ['A', 'C', 'B', 'C', 'C', 'A', 'A', 'B', 'C']
        ];
        return board;
    }
    gameLogic.getInitialBoard = getInitialBoard;
    function getRandomBoard(board, startDelta, endDelta) {
        var startRow = startDelta.row;
        var startCol = startDelta.col;
        var endRow = endDelta.row;
        var endCol = endDelta.col;
        for (var i = startRow; i < endRow; i++) {
            board[i] = [];
            for (var j = startCol; j < endCol; j++) {
                board[i][j] = getRandomPet();
            }
        }
    }
    function getRandomPet() {
        var ans = "";
        var randPet = Math.floor((Math.random() * 4) + 1);
        if (randPet == 1) {
            ans = 'A';
        }
        else if (randPet == 2) {
            ans = 'B';
        }
        else if (randPet == 3) {
            ans = 'C';
        }
        else {
            ans = 'D';
        }
        return ans;
    }
    function getInitialState() {
        var scores = [];
        for (var i = 0; i < NUM_PLAYERS; i++) {
            scores[i] = 0;
        }
        return {
            board: getInitialBoard(),
            fromDelta: null,
            toDelta: null,
            scores: scores,
            completedSteps: 0,
            boardCount: null
        };
    }
    gameLogic.getInitialState = getInitialState;
    function createInitialMove() {
        return {
            endMatchScores: null,
            turnIndexAfterMove: 0,
            stateAfterMove: getInitialState()
        };
    }
    gameLogic.createInitialMove = createInitialMove;
    /**
     * @ Return boolean value indicating whether there is a tie.
     * @ Param current state values.
     **/
    function isTie(curState) {
        var steps = curState.completedSteps;
        var scores = curState.scores;
        if (steps >= gameLogic.PARAMS.TOTALSTEPS && haveDuplicateScores(scores)) {
            return true;
        }
        return false;
    }
    function haveDuplicateScores(scores) {
        var counts = {};
        for (var i = 0; i < scores.length; i++) {
            if (counts[scores[i]]) {
                return true;
            }
            else {
                counts[scores[i]] = 1;
            }
        }
        return false;
    }
    /**
     * @ Return The index of the winner with max score.
     **/
    function getWinner(curState) {
        var steps = curState.completedSteps;
        var scores = curState.scores;
        var max = 0;
        var maxIndex = -1;
        if (steps >= gameLogic.PARAMS.TOTALSTEPS) {
            for (var i = 0; i < scores.length; i++) {
                if (max < scores[i]) {
                    max = scores[i];
                    maxIndex = i;
                }
            }
        }
        return maxIndex;
    }
    /**
     * @ Return info of all matched pets with pet in fromDelta or toDelta.
     **/
    function getMatch(board, fromDelta, toDelta) {
        var match = [];
        /*
        let COLL : number = Math.min(fromDelta.col, toDelta.col);
        let COLR : number = Math.max(fromDelta.col, toDelta.col);
        let ROWL : number = Math.min(fromDelta.row, toDelta.row);
        let ROWR : number = Math.max(fromDelta.col, toDelta.col); */
        var i = 0;
        //swap on temp board
        var petFrom = board[fromDelta.row][fromDelta.col];
        board[fromDelta.row][fromDelta.col] = board[toDelta.row][toDelta.col];
        board[toDelta.row][toDelta.col] = petFrom;
        //check alignment for pet currently in fromIndex
        var target = board[fromDelta.row][fromDelta.col];
        var count = 1;
        var startDelta = {
            row: 0,
            col: 0
        };
        var endDelta = {
            row: 0,
            col: 0
        };
        startDelta.row = fromDelta.row;
        endDelta.row = fromDelta.row;
        var col = fromDelta.col;
        for (col = fromDelta.col + 1; col < gameLogic.PARAMS.COLS; col++) {
            if (board[fromDelta.row][col] === target) {
                count++;
            }
            else {
                break;
            }
        }
        endDelta.col = col - 1;
        // window.alert("end col " + endDelta.col);
        for (col = fromDelta.col - 1; col >= 0; col--) {
            if (board[fromDelta.row][col] === target) {
                count++;
            }
            else {
                break;
            }
        }
        startDelta.col = col + 1;
        //window.alert("start col " + startDelta.col);
        //window.alert("count " + count);
        if (count >= 3) {
            var lDelta = {
                startDelta: startDelta,
                endDelta: endDelta
            };
            match[i++] = lDelta;
        }
        startDelta = angular.copy(startDelta);
        endDelta = angular.copy(endDelta);
        startDelta.col = fromDelta.col;
        endDelta.col = fromDelta.col;
        count = 1;
        var row = fromDelta.row;
        for (row = fromDelta.row + 1; row < gameLogic.PARAMS.ROWS; row++) {
            if (board[row][fromDelta.col] === target) {
                count++;
            }
            else {
                break;
            }
        }
        endDelta.row = row - 1;
        for (row = fromDelta.row - 1; row >= 0; row--) {
            if (board[row][fromDelta.col] === target) {
                count++;
            }
            else {
                break;
            }
        }
        startDelta.row = row + 1;
        if (count >= 3) {
            var lDelta = {
                startDelta: startDelta,
                endDelta: endDelta
            };
            match[i++] = lDelta;
        }
        //check check alignment for pet currently in toIndex
        target = board[toDelta.row][toDelta.col];
        count = 1;
        col = toDelta.col;
        startDelta = angular.copy(startDelta);
        endDelta = angular.copy(endDelta);
        startDelta.row = toDelta.row;
        endDelta.row = toDelta.row;
        for (col = toDelta.col + 1; col < gameLogic.PARAMS.COLS; col++) {
            if (board[toDelta.row][col] === target) {
                count++;
            }
            else {
                break;
            }
        }
        endDelta.col = col - 1;
        for (col = toDelta.col - 1; col >= 0; col--) {
            if (board[toDelta.row][col] === target) {
                count++;
            }
            else {
                break;
            }
        }
        startDelta.col = col + 1;
        if (count >= 3) {
            var lDelta = {
                startDelta: startDelta,
                endDelta: endDelta
            };
            match[i++] = lDelta;
        }
        count = 1;
        startDelta = angular.copy(startDelta);
        endDelta = angular.copy(endDelta);
        startDelta.col = toDelta.col;
        endDelta.col = toDelta.col;
        for (row = toDelta.row + 1; row < gameLogic.PARAMS.ROWS; row++) {
            if (board[row][toDelta.col] === target) {
                count++;
            }
            else {
                break;
            }
        }
        endDelta.row = row - 1;
        for (row = toDelta.row - 1; row >= 0; row--) {
            if (board[row][toDelta.col] === target) {
                count++;
            }
            else {
                break;
            }
        }
        startDelta.row = row + 1;
        if (count >= 3) {
            var lDelta = {
                startDelta: startDelta,
                endDelta: endDelta
            };
            match[i++] = lDelta;
        }
        return match;
    }
    function shouldShuffle(curState) {
        var board = curState.board;
        for (var row = 0; row < gameLogic.PARAMS.ROWS; row++) {
            var count = 1;
            var preType = board[row][0];
            var col = 1;
            while (col < gameLogic.PARAMS.COLS) {
                if (board[row][col] == preType) {
                    count++;
                }
                else {
                    preType = board[row][col];
                    count = 0;
                }
                if (count == 2) {
                    col++;
                }
                if (count >= 3) {
                    return true;
                }
                col++;
            }
            count = 1;
            col = gameLogic.PARAMS.COLS - 2;
            preType = board[row][gameLogic.PARAMS.COLS - 1];
            while (col >= 0) {
                if (board[row][col] == preType) {
                    count++;
                }
                else {
                    preType = board[row][col];
                    count = 0;
                }
                if (count == 2) {
                    col--;
                }
                if (count >= 3) {
                    return true;
                }
                col--;
            }
        }
        for (var col = 0; col < gameLogic.PARAMS.COLS; col++) {
            var count = 1;
            var preType = board[0][col];
            var row = 1;
            while (row < gameLogic.PARAMS.ROWS) {
                if (board[row][col] == preType) {
                    count++;
                }
                else {
                    preType = board[row][col];
                    count = 0;
                }
                if (count == 2) {
                    row++;
                }
                if (count >= 3) {
                    return true;
                }
                row++;
            }
            count = 1;
            row = gameLogic.PARAMS.ROWS - 2;
            preType = board[gameLogic.PARAMS.ROWS - 1][col];
            while (row >= 0) {
                if (board[row][col] == preType) {
                    count++;
                }
                else {
                    preType = board[row][col];
                    count = 0;
                }
                if (count == 2) {
                    row--;
                }
                if (count >= 3) {
                    return true;
                }
                row--;
            }
        }
        return false;
    }
    function shuffle(curState) {
        return curState;
    }
    /**
     * Find match of 3 and over 3, update board
     * @ board board before update
     * @ return board after update
     **/
    function updateBoard(board, fromDelta, toDelta) {
        var boardTemp = angular.copy(board);
        var match = getMatch(boardTemp, fromDelta, toDelta);
        if (!match || match.length === 0) {
            throw new Error("Can only make a move for pet matches of 3 or over 3!");
        }
        //window.alert(match.length);
        var count = 0;
        //mark elements to be removed
        var visited = [];
        for (var row = 0; row < gameLogic.PARAMS.ROWS; row++) {
            visited[row] = [];
            for (var col = 0; col < gameLogic.PARAMS.COLS; col++) {
                visited[row][col] = false;
            }
        }
        for (var i = 0; i < match.length; i++) {
            var line = match[i];
            if (!line) {
                throw new Error("line is empty!");
            }
            if (line.startDelta.row === line.endDelta.row) {
                var row = line.startDelta.row;
                //window.alert("row " + row);
                //window.alert("start col " + line.startDelta.col + " end col " + line.endDelta.col);
                for (var col = line.startDelta.col; col <= line.endDelta.col; col++) {
                    //window.alert("cell1 " + " row " + row + " col " + col)
                    if (!visited[row][col]) {
                        visited[row][col] = true;
                        //window.alert("cell " + " row " + row + " col " + col);
                        count++;
                    }
                }
            }
            else if (line.startDelta.col === line.endDelta.col) {
                var col = line.startDelta.col;
                for (var row = line.startDelta.row; row <= line.endDelta.row; row++) {
                    if (!visited[row][col]) {
                        visited[row][col] = true;
                        count++;
                    }
                }
            }
            else {
                throw new Error("Error in getting match, should have same col or row!");
            }
        }
        //initialize
        var newBoard = [];
        for (var row = 0; row < gameLogic.PARAMS.ROWS; row++) {
            newBoard[row] = [];
            for (var col = 0; col < gameLogic.PARAMS.COLS; col++) {
                newBoard[row][col] = "";
            }
        }
        //update
        for (var col = 0; col < gameLogic.PARAMS.COLS; col++) {
            var newRow = gameLogic.PARAMS.ROWS - 1;
            for (var row = gameLogic.PARAMS.ROWS - 1; row >= 0; row--) {
                if (!visited[row][col]) {
                    newBoard[newRow][col] = board[row][col];
                    newRow--;
                }
            }
        }
        for (var row = 0; row < gameLogic.PARAMS.ROWS; row++) {
            for (var col = 0; col < gameLogic.PARAMS.COLS; col++) {
                if (!newBoard[row][col]) {
                    newBoard[row][col] = getRandomPet();
                }
            }
        }
        return {
            board: newBoard,
            count: count
        };
    }
    gameLogic.updateBoard = updateBoard;
    /*
    export function getChangedDeltaBoardAndScores(board : Board, fromDelta : BoardDelta, toDelta : BoardDelta) : changedDeltaBoardAndScores{
      
      let boardCount : BoardCount = updateBoard(board, match);
    } */
    /**
     * @ params stateAfterMove state before make move
     * @ return state after make move
     * **/
    function checkBoard(stateBeforeMove, turnIndexBeforeMove, boardCount) {
        //switch pets with pos of fromDelta and toDelta
        var fromDelta = stateBeforeMove.fromDelta;
        var toDelta = stateBeforeMove.toDelta;
        var board = angular.copy(stateBeforeMove.board);
        var tmpStr = board[fromDelta.row][fromDelta.col];
        board[fromDelta.row][fromDelta.col] = board[toDelta.row][toDelta.col];
        board[toDelta.row][toDelta.col] = tmpStr;
        //remove match >= 3, update score and board 
        var stateAfterMove = angular.copy(stateBeforeMove);
        stateAfterMove.board = boardCount.board;
        stateAfterMove.scores[turnIndexBeforeMove] = boardCount.count * 10;
        stateAfterMove.boardCount = boardCount;
        stateAfterMove.completedSteps = stateBeforeMove.completedSteps + 1;
        return stateAfterMove;
    }
    /**
       * Returns the move that should be performed when player
       * with index turnIndexBeforeMove makes a move in cell row X col.
       */
    function createMove(stateBeforeMove, changedBoardCount, turnIndexBeforeMove) {
        if (!stateBeforeMove) {
            stateBeforeMove = getInitialState();
        }
        var board = stateBeforeMove.board;
        var fromDelta = stateBeforeMove.fromDelta;
        var toDelta = stateBeforeMove.toDelta;
        //let scores : number[] = stateBeforeMove.scores;
        if (getWinner(stateBeforeMove) !== -1 || isTie(stateBeforeMove)) {
            throw new Error("Can only make a move if the game is not over!");
        }
        if (fromDelta.row !== toDelta.row && fromDelta.col !== toDelta.col) {
            throw new Error("Can only swap adjacent pets!");
        }
        //get state after movement 
        var stateAfterMove = checkBoard(stateBeforeMove, turnIndexBeforeMove, changedBoardCount);
        var winner = getWinner(stateAfterMove);
        var endMatchScores;
        var turnIndexAfterMove;
        if (winner !== -1 || isTie(stateAfterMove)) {
            // Game over.
            turnIndexAfterMove = -1;
            endMatchScores = winner === 0 ? [1, 0] : winner === 1 ? [0, 1] : [0, 0];
        }
        else {
            // Game continues. Now it's the opponent's turn (the turn switches from 0 to 1 and 1 to 0).
            turnIndexAfterMove = 1 - turnIndexBeforeMove;
            endMatchScores = null;
        }
        return { endMatchScores: endMatchScores, turnIndexAfterMove: turnIndexAfterMove, stateAfterMove: stateAfterMove };
    }
    gameLogic.createMove = createMove;
    function checkMoveOk(stateTransition) {
        // We can assume that turnIndexBeforeMove and stateBeforeMove are legal, and we need
        // to verify that the move is OK.
        var turnIndexBeforeMove = stateTransition.turnIndexBeforeMove;
        var stateBeforeMove = stateTransition.stateBeforeMove;
        var move = stateTransition.move;
        if (!stateBeforeMove && turnIndexBeforeMove === 0 &&
            angular.equals(createInitialMove(), move)) {
            return;
        }
        var boardCount = stateTransition.move.stateAfterMove.boardCount;
        var expectedMove = createMove(stateBeforeMove, boardCount, turnIndexBeforeMove);
        if (!angular.equals(move, expectedMove)) {
            throw new Error("Expected move=" + angular.toJson(expectedMove, true) +
                ", but got stateTransition=" + angular.toJson(stateTransition, true));
        }
    }
    gameLogic.checkMoveOk = checkMoveOk;
    function forSimpleTestHtml() {
        var line1 = {
            startDelta: {
                row: 5,
                col: 5
            },
            endDelta: {
                row: 8,
                col: 5
            }
        };
        var lines = [];
        lines[0] = line1;
        var board = getInitialBoard();
    }
    gameLogic.forSimpleTestHtml = forSimpleTestHtml;
})(gameLogic || (gameLogic = {}));
//# sourceMappingURL=gameLogic.js.map