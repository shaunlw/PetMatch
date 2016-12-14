var gameLogic;
(function (gameLogic) {
    gameLogic.PARAMS = {
        ROWS: 9,
        COLS: 9,
        TOTALSTEPS: 30
    };
    var NUM_PLAYERS = 2;
    var NUM_TYPES = 4;
    var testMode = false;
    /**
     * @ Return the initial PetMatch board.
     *   a ROWSxCOLS matrix containing four types of pets.
     **/
    function getInitialBoard() {
        var board = getRandomBoard();
        while (shouldShuffle(board)) {
            board = shuffle();
        }
        return board;
    }
    gameLogic.getInitialBoard = getInitialBoard;
    function getRandomBoard() {
        var board = [];
        for (var i = 0; i < gameLogic.PARAMS.ROWS; i++) {
            board[i] = [];
            for (var j = 0; j < gameLogic.PARAMS.COLS; j++) {
                board[i][j] = getRandomPet();
            }
        }
        return board;
    }
    function getRandomPet() {
        if (testMode) {
            return "A";
        }
        var ans = "";
        var randPet = Math.floor(Math.random() * NUM_TYPES + 1);
        if (randPet === 1) {
            ans = 'A';
        }
        else if (randPet === 2) {
            ans = 'B';
        }
        else if (randPet === 3) {
            ans = 'C';
        }
        else if (randPet === 4) {
            ans = 'D';
        }
        return ans;
    }
    function setTestMode(mode) {
        testMode = mode;
    }
    gameLogic.setTestMode = setTestMode;
    function getInitialState() {
        // let scores : number[] = [];
        // for (let i = 0; i < NUM_PLAYERS; i++) {
        //   scores[i] = 0;
        // }
        return {
            board: getInitialBoard(),
            fromDelta: null,
            toDelta: null,
            scores: [0, 0],
            completedSteps: [0, 0],
            changedDelta: null
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
        var stepsReached = true;
        for (var i = 0; i < steps.length; i++) {
            if (steps[i] < gameLogic.PARAMS.TOTALSTEPS) {
                stepsReached = false;
            }
        }
        if (stepsReached && haveDuplicateScores(scores)) {
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
        if (isTie(curState)) {
            return '';
        }
        var steps = curState.completedSteps;
        var stepsReached = true;
        for (var i = 0; i < steps.length; i++) {
            if (steps[i] < gameLogic.PARAMS.TOTALSTEPS) {
                stepsReached = false;
            }
        }
        var scores = curState.scores;
        if (stepsReached) {
            var max = Math.max.apply(null, scores);
            ;
            for (var i = 0; i < scores.length; i++) {
                if (max === scores[i]) {
                    return i + '';
                }
            }
        }
        return '';
    }
    /**
     * @ Return info of all matched pets with pet in fromDelta or toDelta.
     **/
    function getMatch(board, fromDelta, toDelta) {
        var match = [];
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
        for (col = fromDelta.col - 1; col >= 0; col--) {
            if (board[fromDelta.row][col] === target) {
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
        //check alignment for pet currently in toIndex
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
        if (count >= 3 && fromDelta.row != toDelta.row) {
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
        if (count >= 3 && fromDelta.col != toDelta.col) {
            var lDelta = {
                startDelta: startDelta,
                endDelta: endDelta
            };
            match[i++] = lDelta;
        }
        return match;
    }
    gameLogic.getMatch = getMatch;
    function shouldShuffle(board) {
        var petsToSwitch = getPossibleMove(board);
        if (!petsToSwitch.fromDelta.row && !petsToSwitch.toDelta.row
            && !petsToSwitch.fromDelta.col && !petsToSwitch.toDelta.col) {
            return true;
        }
        return false;
    }
    gameLogic.shouldShuffle = shouldShuffle;
    function shuffle() {
        return getRandomBoard();
    }
    gameLogic.shuffle = shuffle;
    function getPossibleMove(board) {
        var boardTemp = angular.copy(board);
        var deltaF = {
            row: 0,
            col: 0
        };
        var deltaT = {
            row: 0,
            col: 0
        };
        var deltaFrom = {
            row: 0,
            col: 0
        };
        var deltaTo = {
            row: 0,
            col: 0
        };
        var maxSize = 0;
        for (var i = 0; i < gameLogic.PARAMS.ROWS; i++) {
            deltaF.row = i;
            deltaT.row = i;
            for (var j = 1; j < gameLogic.PARAMS.COLS; j++) {
                deltaF.col = j;
                deltaT.col = j - 1;
                var boardTemp1 = angular.copy(board);
                var tpMatch = gameLogic.getMatch(boardTemp1, deltaF, deltaT);
                var size = getMatchSize(tpMatch, deltaF, deltaT);
                if (size > maxSize) {
                    maxSize = size;
                    deltaFrom.row = deltaF.row;
                    deltaFrom.col = deltaF.col;
                    deltaTo.row = deltaT.row;
                    deltaTo.col = deltaT.col;
                }
            }
        }
        for (var i = 0; i < gameLogic.PARAMS.COLS; i++) {
            deltaF.col = i;
            deltaT.col = i;
            for (var j = 1; j < gameLogic.PARAMS.ROWS; j++) {
                deltaF.row = j;
                deltaT.row = j - 1;
                var boardTemp2 = angular.copy(board);
                var tpMatch = gameLogic.getMatch(boardTemp2, deltaF, deltaT);
                var size = getMatchSize(tpMatch, deltaF, deltaT);
                if (size > maxSize) {
                    maxSize = size;
                    deltaFrom.row = deltaF.row;
                    deltaFrom.col = deltaF.col;
                    deltaTo.row = deltaT.row;
                    deltaTo.col = deltaT.col;
                }
            }
        }
        var possibleMove = {
            fromDelta: deltaFrom,
            toDelta: deltaTo
        };
        return possibleMove;
    }
    gameLogic.getPossibleMove = getPossibleMove;
    function getMatchSize(match, deltaF, deltaT) {
        var count = 0;
        var rowF = false;
        var rowT = false;
        var colF = false;
        var colT = false;
        for (var i = 0; i < match.length; i++) {
            var matchI = match[i];
            if (matchI.endDelta.row === matchI.startDelta.row
                && (matchI.endDelta.row === deltaF.row || matchI.endDelta.row === deltaT.row)) {
                if (deltaF.row === deltaT.row && !rowF && !rowT) {
                    rowF = true;
                    rowT = true;
                    count += Math.abs(matchI.endDelta.col - matchI.startDelta.col) + 1;
                }
                else if (!rowF) {
                    rowF = true;
                    count += Math.abs(matchI.endDelta.col - matchI.startDelta.col) + 1;
                }
                else if (!rowT) {
                    rowT = true;
                    count += Math.abs(matchI.endDelta.col - matchI.startDelta.col) + 1;
                }
                else {
                    count += Math.abs(matchI.endDelta.col - matchI.startDelta.col);
                }
                if (matchI.endDelta.row === deltaF.row &&
                    deltaF.col >= matchI.startDelta.col && deltaF.col <= matchI.endDelta.col) {
                    colF = true;
                }
                if (matchI.endDelta.row === deltaT.row &&
                    deltaT.col >= matchI.startDelta.col && deltaT.col <= matchI.endDelta.col) {
                    colT = true;
                }
            }
            else if (matchI.endDelta.col === matchI.startDelta.col
                && (matchI.endDelta.col === deltaF.col || matchI.endDelta.col === deltaT.col)) {
                if (deltaF.col === deltaT.col && !colF && !colT) {
                    colF = true;
                    colT = true;
                    count += Math.abs(matchI.endDelta.row - matchI.startDelta.row) + 1;
                }
                else if (!colF) {
                    colF = true;
                    count += Math.abs(matchI.endDelta.row - matchI.startDelta.row) + 1;
                }
                else if (!colT) {
                    colT = true;
                    count += Math.abs(matchI.endDelta.row - matchI.startDelta.row) + 1;
                }
                else {
                    count += Math.abs(matchI.endDelta.row - matchI.startDelta.row);
                }
                if (matchI.endDelta.col === deltaF.col &&
                    deltaF.row >= matchI.startDelta.row && deltaF.row <= matchI.endDelta.row) {
                    rowF = true;
                }
                if (matchI.endDelta.col === deltaT.col &&
                    deltaT.row >= matchI.startDelta.row && deltaT.row <= matchI.endDelta.row) {
                    rowT = true;
                }
            }
            else {
                throw new Error("wrong matches");
            }
        }
        return count;
    }
    function getChangedDelta(match) {
        var changedDelta = [];
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
                for (var col = line.startDelta.col; col <= line.endDelta.col; col++) {
                    for (var i_1 = row; i_1 >= 0; i_1--) {
                        if (!visited[i_1][col]) {
                            visited[i_1][col] = true;
                            changedDelta.push({ row: i_1, col: col });
                        }
                    }
                }
            }
            else if (line.startDelta.col === line.endDelta.col) {
                var col = line.startDelta.col;
                for (var row = Math.max(line.startDelta.row, line.endDelta.row); row >= 0; row--) {
                    if (!visited[row][col]) {
                        visited[row][col] = true;
                        changedDelta.push({ row: row, col: col });
                    }
                }
            }
            else {
                throw new Error("Error in getting match, should have same col or row!");
            }
        }
        return changedDelta;
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
        var changedDelta = getChangedDelta(match);
        //swap on temp board
        var petFrom = board[fromDelta.row][fromDelta.col];
        board[fromDelta.row][fromDelta.col] = board[toDelta.row][toDelta.col];
        board[toDelta.row][toDelta.col] = petFrom;
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
                for (var col = line.startDelta.col; col <= line.endDelta.col; col++) {
                    if (!visited[row][col]) {
                        visited[row][col] = true;
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
            changedDelta: changedDelta,
            board: newBoard,
            count: count
        };
    }
    gameLogic.updateBoard = updateBoard;
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
        stateAfterMove.changedDelta = boardCount.changedDelta;
        stateAfterMove.board = boardCount.board;
        stateAfterMove.scores[turnIndexBeforeMove] = stateBeforeMove.scores[turnIndexBeforeMove] + boardCount.count * 10;
        stateAfterMove.completedSteps[turnIndexBeforeMove] = stateBeforeMove.completedSteps[turnIndexBeforeMove] + 1;
        return stateAfterMove;
    }
    /**
    * @ Return the move that should be performed when player
    * with index turnIndexBeforeMove makes a move in cell row X col.
    **/
    function createMove(stateBeforeMove, fromDelta, toDelta, turnIndexBeforeMove) {
        if (!stateBeforeMove) {
            stateBeforeMove = getInitialState();
        }
        if (isTie(stateBeforeMove) || getWinner(stateBeforeMove) !== '') {
            throw new Error("Can only make a move if the game is not over!");
        }
        if (!fromDelta || !toDelta) {
            throw new Error("Cannot have empty delta value!");
        }
        if (Math.abs(fromDelta.row - toDelta.row) + Math.abs(fromDelta.col - toDelta.col) != 1) {
            throw new Error("Can only swap adjacent pets!");
        }
        stateBeforeMove.fromDelta = fromDelta;
        stateBeforeMove.toDelta = toDelta;
        var changedBoardCount = updateBoard(stateBeforeMove.board, fromDelta, toDelta);
        //get state after movement 
        var stateAfterMove = checkBoard(stateBeforeMove, turnIndexBeforeMove, changedBoardCount);
        stateAfterMove.fromDelta = fromDelta;
        stateAfterMove.toDelta = toDelta;
        var winner = getWinner(stateAfterMove);
        var endMatchScores;
        var turnIndexAfterMove;
        if (winner !== '' || isTie(stateAfterMove)) {
            // Game over.
            turnIndexAfterMove = -1;
            endMatchScores = winner === '0' ? [1, 0] : winner === '1' ? [0, 1] : [0, 0];
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
        var fromDelta = stateTransition.move.stateAfterMove.fromDelta;
        var toDelta = stateTransition.move.stateAfterMove.toDelta;
        var expectedMove = createMove(stateBeforeMove, fromDelta, toDelta, turnIndexBeforeMove);
        if (!angular.equals(move, expectedMove)) {
            throw new Error("Expected move =" + angular.toJson(expectedMove, true) +
                ", but got stateTransition =" + angular.toJson(stateTransition, true));
        }
    }
    gameLogic.checkMoveOk = checkMoveOk;
    function checkMoveOkN(stateTransition) {
    }
    gameLogic.checkMoveOkN = checkMoveOkN;
    function forSimpleTestHtml() {
        var board = getRandomBoard();
        return getPossibleMove(board);
    }
    gameLogic.forSimpleTestHtml = forSimpleTestHtml;
})(gameLogic || (gameLogic = {}));
//# sourceMappingURL=gameLogic.js.map