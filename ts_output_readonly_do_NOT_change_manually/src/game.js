;
var game;
(function (game) {
    var gameArea = null;
    var PARAMS = gameLogic.PARAMS;
    game.currentUpdateUI = null;
    game.didMakeMove = false; // You can only make one move per updateUI
    game.animationEnded = false;
    game.animationEndedTimeout = null;
    game.state = null;
    game.board = null;
    game.startDelta = null;
    game.ele = null;
    function getCurScore() {
        var afterscoresum = 0;
        var beforePlayer0 = 0;
        var beforePlayer1 = 0;
        var afterPlayer0 = 0;
        var afterPlayer1 = 0;
        if (game.currentUpdateUI.move.stateAfterMove) {
            afterPlayer0 = game.currentUpdateUI.move.stateAfterMove.scores[0];
            afterPlayer1 = game.currentUpdateUI.move.stateAfterMove.scores[1];
            afterscoresum = afterPlayer0 + afterPlayer1;
        }
        var beforescoresum = 0;
        if (game.currentUpdateUI.stateBeforeMove) {
            beforePlayer0 = game.currentUpdateUI.stateBeforeMove.scores[0];
            beforePlayer1 = game.currentUpdateUI.stateBeforeMove.scores[1];
            beforescoresum = beforePlayer0 + beforePlayer1;
        }
        var b = false;
        if (afterPlayer0 - beforePlayer0 > 0) {
            b = game.currentUpdateUI.yourPlayerIndex === 0;
            log.info("scoreby0", game.currentUpdateUI.yourPlayerIndex);
        }
        else if (afterPlayer1 - beforePlayer1 > 0) {
            b = game.currentUpdateUI.yourPlayerIndex === 1;
            log.info("scoreby1", game.currentUpdateUI.yourPlayerIndex);
        }
        return afterscoresum - beforescoresum;
    }
    game.getCurScore = getCurScore;
    function getMyScore() {
        return game.state.scores[game.currentUpdateUI.move.turnIndexAfterMove];
    }
    game.getMyScore = getMyScore;
    function shouldShowScore() {
        return !game.animationEnded && (getMyScore() !== 0 || getMyCompletedSteps() == 0) && getOpponentCompletedSteps() !== 0;
    }
    game.shouldShowScore = shouldShowScore;
    function getOpponentScore() {
        return game.state.scores[1 - game.currentUpdateUI.move.turnIndexAfterMove];
    }
    game.getOpponentScore = getOpponentScore;
    function getTotSteps() {
        return PARAMS.TOTALSTEPS;
    }
    game.getTotSteps = getTotSteps;
    function getMyCompletedSteps() {
        return game.state.completedSteps[1 - game.currentUpdateUI.move.turnIndexAfterMove];
    }
    game.getMyCompletedSteps = getMyCompletedSteps;
    function getOpponentCompletedSteps() {
        return game.state.completedSteps[game.currentUpdateUI.move.turnIndexAfterMove];
    }
    game.getOpponentCompletedSteps = getOpponentCompletedSteps;
    function getTranslations() {
        return {};
    }
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
            checkMoveOk: gameLogic.checkMoveOkN,
            updateUI: updateUI,
            gotMessageFromPlatform: null,
        });
        dragAndDropService.addDragListener("gameBoard", handleDragEvent); //'gameArea' here refers to the reference variable not the string literal representing the element id.
    } //addDragListener() applies a event monitor to 'gameArea', once mouse hovers over 'gameArea', the monitor collects mouse information (type of event, position of curse) to handleEvent that is implemented by users.
    game.init = init;
    // function getTranslation() : Translations {
    //     return {
    //         RULES_OF_PETMATCH : {
    //             en : "Rules of PetMatch",
    //             zh : "宠物对对碰游戏规则",
    //         },
    //         PET_MATCH_RULES_SLIDE1 : {
    //             en : "You and your opponent take turns to swap adjacent animals. If you have 3 or over 3 matches over a line, you get score increased according to the number of matches.",
    //             zh : "你和你的对手轮流进行操作。你需要拖换相邻的宠物。如果拖换之后你得到了三个或者三个以上一样的宠物相连成一条线，连成一条线的宠物数目有多少，你的分数就对应增长多少。",
    //         }
    //     };
    // }
    function handleDragEvent(type, cx, cy) {
        log.log("type", type);
        log.log("cx " + cx);
        log.log("cy : " + cy);
        //if the user drags cell to outside of the game area, the function will take middle point of the nearest cell        
        var cellSize = getCellSize(); //cell size changes when you switch device or resize window             
        var x = Math.min(Math.max(cx - gameArea.offsetLeft, cellSize.width / 2), gameArea.clientWidth - cellSize.width / 2); //convert absolute position to relative position (relative to parent element)
        var y = Math.min(Math.max(cy - gameArea.offsetTop, cellSize.height / 2), gameArea.clientHeight - cellSize.height / 2); //the inner max() takes care if cursor moves to the left or below gameArea. the outer min takes care if cursor moves to the right or top of gameArea
        log.log("x position : " + x);
        log.log("y position : " + y);
        //calculate delta based on mouse position
        var delta = {
            row: Math.floor(PARAMS.ROWS * (y - 0.1 * gameArea.clientHeight) / (gameArea.clientHeight * 0.9)),
            col: Math.floor(PARAMS.COLS * x / gameArea.clientWidth)
        };
        log.log(delta);
        var pos = {
            top: y - cellSize.height * 0.5,
            left: x - cellSize.width * 0.5
        };
        var startPos;
        if (type == "touchstart") {
            game.startDelta = delta; //save start cell, because a new delta will be calculated once pressed mouse is moved.
            startPos = getTopLeft(delta.row, delta.col, cellSize); //save start coordinate
            game.ele = document.getElementById("img_container_" + game.startDelta.row + "_" + game.startDelta.col);
            var style = game.ele.style;
            style['z-index'] = 20;
            setPos(pos, cellSize);
            return;
        }
        //dragging around
        if (type == "touchmove") {
            if (pos)
                setPos(pos, cellSize);
        }
        if (type == "touchend" && game.startDelta) {
            var fromDelta = {
                row: game.startDelta.row,
                col: game.startDelta.col
            };
            var toDelta = {
                row: delta.row,
                col: delta.col
            };
            var nextMove = null;
            if (dragOk(fromDelta, toDelta)) {
                //let changedBoardCount : BoardCount = gameLogic.updateBoard(state.board, fromDelta, toDelta);
                try {
                    nextMove = gameLogic.createMove(game.state, fromDelta, toDelta, game.currentUpdateUI.move.turnIndexAfterMove);
                }
                catch (e) {
                    log.info(["Move is illegal:", e]);
                    endDragAndDrop(); //move back to original position
                    return;
                }
                makeMove(nextMove); //make legal move
            }
        }
        if (type === "touchend" || type === "touchcancel" || type === "touchleave") {
            endDragAndDrop();
        }
    }
    game.handleDragEvent = handleDragEvent;
    function getCellSize() {
        return {
            width: gameArea.clientWidth / PARAMS.COLS,
            height: (gameArea.clientHeight) * 0.9 / PARAMS.ROWS
        };
    }
    /**
   * Set the TopLeft of the element.
   */
    function setPos(pos, cellSize) {
        var startPos = getTopLeft(game.startDelta.row, game.startDelta.col, cellSize);
        var deltaX = pos.left - startPos.left;
        var deltaY = pos.top - startPos.top;
        var transform = "translate(" + deltaX + "px," + deltaY + "px) scale(1.2)";
        var style = game.ele.style;
        log.log("pos.top:" + pos.top + "; startPos.top:" + startPos.top);
        style['transform'] = transform;
        style['-webkit-transform'] = transform;
        style['will-change'] = "transform"; // https://developer.mozilla.org/en-US/docs/Web/CSS/will-change
    }
    /**
     * Get the position of the cell.
     **/
    function getTopLeft(row, col, cellSize) {
        var top = row * cellSize.height + gameArea.clientHeight * 0.1; //10% of gameArea height is used for score board
        var left = col * cellSize.width;
        var pos = { top: top, left: left };
        return pos;
    }
    function animationEndedCallback() {
        log.info("Animation ended");
        maybeSendComputerMove();
        game.animationEnded = true;
    }
    function clearAnimationTimeout() {
        if (game.animationEndedTimeout) {
            $timeout.cancel(game.animationEndedTimeout);
            game.animationEndedTimeout = null;
        }
    }
    function updateUI(params) {
        log.info("Game got updateUI :", params);
        game.animationEnded = false;
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
    function maybeSendComputerMove() {
        if (!isComputerTurn())
            return;
        var move = aiService.findComputerMove(game.currentUpdateUI.move);
        log.info("Computer move: ", move);
        makeMove(move);
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
        game.startDelta = null;
    }
    function endDragAndDrop() {
        game.startDelta = null;
        if (game.ele)
            game.ele.removeAttribute("style");
        game.ele = null;
    }
    function getMoveDownClass(row, col) {
        var res = 0;
        if (game.state.changedDelta) {
            for (var i = 0; i < game.state.changedDelta.length; i++) {
                if (game.state.changedDelta[i].row >= row && game.state.changedDelta[i].col === col) {
                    res++; //sum up how many cells below you have been modified; this is the number of steps you need to move down.
                }
            }
        }
        // log.info("test it out", row, col, res, state.changedDelta);
        if (res !== 0 && game.state.changedDelta)
            return 'movedown' + res; //return how many steps you need to move down
        return ''; //you don't need to move'
    }
    game.getMoveDownClass = getMoveDownClass;
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
    function isPassAndPlay() {
        return game.currentUpdateUI.playMode === 'passAndPlay';
    }
    game.isPassAndPlay = isPassAndPlay;
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
    game.isMyTurn = isMyTurn;
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
    $rootScope['game'] = game; //create a subscope in rootscope and name it 'game', asign it with the herein defined 'game'module
    game.init(); //does this get run before rendering the view? i.e. can dom display values created by this ini()?
});
//# sourceMappingURL=game.js.map