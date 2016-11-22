;
var game;
(function (game) {
    var gameArea = null;
    var PARAMS = gameLogic.PARAMS;
    game.currentUpdateUI = null;
    game.didMakeMove = false; // You can only make one move per updateUI
    game.animationEndedTimeout = null;
    game.state = null;
    game.board = null;
    game.dragAndDropStartPos = null;
    game.dragAndDropElement = null;
    function init() {
        registerServiceWorker();
        gameArea = document.getElementById("gameArea");
        if (!gameArea)
            throw new Error("Can't find gameArea!");
        translate.setTranslations(getTranslations());
        translate.setLanguage('en');
        resizeGameAreaService.setWidthToHeight(1);
        moveService.setGame({
            minNumberOfPlayers: 2,
            maxNumberOfPlayers: 2,
            checkMoveOk: gameLogic.checkMoveOk,
            updateUI: updateUI,
            gotMessageFromPlatform: null,
        });
        dragAndDropService.addDragListener("gameArea", handleDragEvent);
    }
    game.init = init;
    function getTranslations() {
        return {};
    }
    function updateUI(params) {
        log.info("Game got updateUI :", params);
        game.didMakeMove = false; // Only one move per updateUI
        game.currentUpdateUI = params;
        clearAnimationTimeout();
        clearDragAndDrop();
        game.state = params.move.stateAfterMove;
        if (isFirstMove()) {
            game.state = gameLogic.getInitialState();
            if (isMyTurn())
                makeMove(gameLogic.createInitialMove());
        }
        else {
            // We calculate the AI move only after the animation finishes,
            // because if we call aiService now
            // then the animation will be paused until the javascript finishes.
            game.animationEndedTimeout = $timeout(animationEndedCallback, 500);
        }
    }
    game.updateUI = updateUI;
    function animationEndedCallback() {
        log.info("Animation ended");
        maybeSendComputerMove();
    }
    function maybeSendComputerMove() {
        if (!isComputerTurn())
            return;
        //let move = aiService.findComputerMove(currentUpdateUI.move);
        //log.info("Computer move: ", move);
        // makeMove(move);
    }
    function clearAnimationTimeout() {
        if (game.animationEndedTimeout) {
            $timeout.cancel(game.animationEndedTimeout);
            game.animationEndedTimeout = null;
        }
    }
    function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            var n = navigator;
            log.log('Calling serviceWorker.register');
            n.serviceWorker.register('service-worker.js').then(function (registration) {
                log.log('ServiceWorker registration successful with scope: ', registration.scope);
            }).catch(function (err) {
                log.log('ServiceWorker registration failed: ', err);
            });
        }
    }
    function handleDragEvent(type, cx, cy) {
        log.log("type", type);
        log.log("cx " + cx);
        log.log("cy : " + cy);
        var cellSize = getCellSize();
        //set x and y as if the offsetLeft/ offsetTop are start point(zero)
        //if the user drags cell to outside of the game area, the function will take middle point of the nearest cell 
        var x = Math.min(Math.max(cx - gameArea.offsetLeft, cellSize.width / 2), gameArea.clientWidth - cellSize.width / 2);
        var y = Math.min(Math.max(cy - gameArea.offsetTop, cellSize.height / 2), gameArea.clientHeight - cellSize.height / 2);
        log.log("x position : " + x);
        log.log("y position : " + y);
        var dragAndDropPos = {
            top: y - cellSize.height * 0.605,
            left: x - cellSize.width * 0.605
        };
        //left for animation purpose
        if (type == "touchmove") {
            //if (dragAndDropStartPos) setDragAndDropPos(dragAndDropPos, cellSize);
            return;
        }
        //get the index of cell based on current pos (cx, cy)
        var delta = {
            row: Math.floor(PARAMS.ROWS * y / gameArea.clientHeight),
            col: Math.floor(PARAMS.COLS * x / gameArea.clientWidth)
        };
        log.log(delta);
        if (type == "touchstart") {
            game.dragAndDropStartPos = delta;
        }
        if (type == "touchend" && game.dragAndDropStartPos) {
            var fromDelta = {
                row: game.dragAndDropStartPos.row,
                col: game.dragAndDropStartPos.col
            };
            var toDelta = {
                row: delta.row,
                col: delta.col
            };
            var nextMove = null;
            if (dragOk(fromDelta, toDelta)) {
                game.state.fromDelta = fromDelta;
                game.state.toDelta = toDelta;
                try {
                    nextMove = gameLogic.createMove(game.state, game.currentUpdateUI.move.turnIndexAfterMove);
                }
                catch (e) {
                    log.info(["Move is illegal:", e]);
                    return;
                }
                makeMove(nextMove);
            }
            return;
        }
        if (type === "touchend" || type === "touchcancel" || type === "touchleave") {
            endDragAndDrop();
        }
    }
    game.handleDragEvent = handleDragEvent;
    /**
     * @ params fromDelta position of from cell
     * @ params toDelta position of to cell
     * @ return a boolean value indicating whether it is legal to drag.
     **/
    function dragOk(fromDelta, toDelta) {
        if (!isHumanTurn()) {
            return false;
        }
        return true;
    }
    function clearDragAndDrop() {
        game.dragAndDropStartPos = null;
    }
    function endDragAndDrop() {
        game.dragAndDropStartPos = null;
    }
    function getCellSize() {
        return {
            width: gameArea.clientWidth / PARAMS.COLS,
            height: gameArea.clientHeight / PARAMS.ROWS
        };
    }
    function makeMove(move) {
        if (game.didMakeMove) {
            return;
        }
        game.didMakeMove = true;
        moveService.makeMove(move);
    }
    function isFirstMove() {
        return !game.currentUpdateUI.move.stateAfterMove;
    }
    function yourPlayerIndex() {
        return game.currentUpdateUI.yourPlayerIndex;
    }
    function isComputer() {
        return game.currentUpdateUI.playersInfo[game.currentUpdateUI.yourPlayerIndex].playerId === '';
    }
    function isComputerTurn() {
        return isMyTurn() && isComputer();
    }
    function isHumanTurn() {
        return isMyTurn() && !isComputer();
    }
    function isMyTurn() {
        return !game.didMakeMove &&
            game.currentUpdateUI.move.turnIndexAfterMove >= 0 &&
            game.currentUpdateUI.yourPlayerIndex === game.currentUpdateUI.move.turnIndexAfterMove; // it's my turn
    }
    function isPieceA(row, col) {
        return game.state.board[row][col] === 'A';
    }
    game.isPieceA = isPieceA;
    function isPieceB(row, col) {
        return game.state.board[row][col] === 'B';
    }
    game.isPieceB = isPieceB;
    function isPieceC(row, col) {
        return game.state.board[row][col] === 'C';
    }
    game.isPieceC = isPieceC;
    function isPieceD(row, col) {
        return game.state.board[row][col] === 'D';
    }
    game.isPieceD = isPieceD;
})(game || (game = {}));
angular.module('myApp', ['gameServices'])
    .run(function () {
    $rootScope['game'] = game;
    game.init();
});
//# sourceMappingURL=game.js.map