interface SupportedLanguages {
    en: string, iw: string,
    pt: string, zh: string,
    el: string, fr: string,
    hi: string, es: string,
};

interface Translations {
    [index : string] : SupportedLanguages;
}

interface CellSize {
    width : number;
    height : number;
}



module game {
    let gameArea : HTMLElement = null;
    let PARAMS : any = gameLogic.PARAMS;
    export let currentUpdateUI: IUpdateUI = null;
    export let didMakeMove: boolean = false; // You can only make one move per updateUI
    export let animationEndedTimeout: ng.IPromise<any> = null;
    export let state: IState = null;
    export let board: Board = null;
    export let dragAndDropStartPos: BoardDelta = null;
    export let dragAndDropElement: HTMLElement = null;

    export function init() {
        registerServiceWorker();
        gameArea = document.getElementById("gameArea");
        if (!gameArea) throw new Error("Can't find gameArea!");

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
    
    function getTranslations(): Translations {
        return {};
    }

    export function updateUI(params: IUpdateUI): void {
    log.info("Game got updateUI :", params);
    didMakeMove = false; // Only one move per updateUI
    currentUpdateUI = params;
    clearAnimationTimeout();
    clearDragAndDrop();
    state = params.move.stateAfterMove;
    if (isFirstMove()) {
      state = gameLogic.getInitialState();
      if (isMyTurn()) makeMove(gameLogic.createInitialMove());
    } else {
      // We calculate the AI move only after the animation finishes,
      // because if we call aiService now
      // then the animation will be paused until the javascript finishes.
      animationEndedTimeout = $timeout(animationEndedCallback, 500);
    }
  }

  function animationEndedCallback() {
    log.info("Animation ended");
    maybeSendComputerMove();
  }

   function maybeSendComputerMove() {
       if (!isComputerTurn()) return;
       //let move = aiService.findComputerMove(currentUpdateUI.move);
       //log.info("Computer move: ", move);
      // makeMove(move);
    }

  function clearAnimationTimeout() {
    if (animationEndedTimeout) {
      $timeout.cancel(animationEndedTimeout);
      animationEndedTimeout = null;
    }
  }

    function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            let n: any = navigator;
            log.log('Calling serviceWorker.register');
            n.serviceWorker.register('service-worker.js').then(function(registration: any) {
                log.log('ServiceWorker registration successful with scope: ',    registration.scope);
            }).catch(function(err: any) {
                log.log('ServiceWorker registration failed: ', err);
            });
        }
    }

    export function handleDragEvent(type : string, cx : number, cy : number) {
        log.log("type", type);
        log.log("cx " + cx);
        log.log("cy : " + cy);
        let cellSize: CellSize = getCellSize();
        //set x and y as if the offsetLeft/ offsetTop are start point(zero)
        //if the user drags cell to outside of the game area, the function will take middle point of the nearest cell 
        let x : number = Math.min(Math.max(cx - gameArea.offsetLeft, cellSize.width / 2), gameArea.clientWidth - cellSize.width / 2);
        let y : number = Math.min(Math.max(cy - gameArea.offsetTop, cellSize.height / 2), gameArea.clientHeight - cellSize.height / 2);
        log.log("x position : " + x);
        log.log("y position : " + y);
        let dragAndDropPos = {
            top : y - cellSize.height * 0.605,
            left : x - cellSize.width * 0.605
        };

        //left for animation purpose
        if (type == "touchmove") {
            //if (dragAndDropStartPos) setDragAndDropPos(dragAndDropPos, cellSize);
            return;
        }
        
        //get the index of cell based on current pos (cx, cy)
        let delta : BoardDelta = {
            row : Math.floor(PARAMS.ROWS * y / gameArea.clientHeight),
            col : Math.floor(PARAMS.COLS * x / gameArea.clientWidth)
        };

        log.log(delta);
        if (type == "touchstart"){
            dragAndDropStartPos = delta;
        }

        if (type == "touchend" && dragAndDropStartPos) {
            let fromDelta = {
                row : dragAndDropStartPos.row,
                col : dragAndDropStartPos.col
            };
            let toDelta = {
                row : delta.row,
                col : delta.col
            };
            
            let nextMove : IMove = null;
            if (dragOk(fromDelta, toDelta)) {
                state.fromDelta = fromDelta;
                state.toDelta = toDelta;
                try {
                    nextMove = gameLogic.createMove(state, currentUpdateUI.move.turnIndexAfterMove);
                } catch (e) {
                    log.info(["Move is illegal:", e]);
                    return;
                }
                makeMove(nextMove);
                //setDragAndDropPos(dragAndDropPos, cellSize);
                //updateCacheAndApply();
            }
            return;
        }

        if (type === "touchend" || type === "touchcancel" || type === "touchleave") {
            endDragAndDrop();
            //updateCacheAndApply(); 
        }
        
    }

    /**
     * @ params fromDelta position of from cell
     * @ params toDelta position of to cell
     * @ return a boolean value indicating whether it is legal to drag.
     **/
    function dragOk(fromDelta : BoardDelta, toDelta : BoardDelta) : boolean {
        if (!isHumanTurn()) {
            return false;
        }
        return true;
    }

    function clearDragAndDrop() {
        dragAndDropStartPos = null;
    }

    function endDragAndDrop() : void {
        dragAndDropStartPos = null;
    }

    function getCellSize() : CellSize {
        return {
            width : gameArea.clientWidth / PARAMS.COLS,
            height : gameArea.clientHeight / PARAMS.ROWS
        };
    }
    
    function makeMove(move: IMove) {
        if (didMakeMove) { // Only one move per updateUI
            return;
        }
        didMakeMove = true;
        moveService.makeMove(move);
    }

    function isFirstMove() {
        return !currentUpdateUI.move.stateAfterMove;
    }

    function yourPlayerIndex() {
        return currentUpdateUI.yourPlayerIndex;
    }

    function isComputer() {
        return currentUpdateUI.playersInfo[currentUpdateUI.yourPlayerIndex].playerId === '';
    }

    function isComputerTurn() {
        return isMyTurn() && isComputer();
    }

    function isHumanTurn() {
        return isMyTurn() && !isComputer();
    }

    function isMyTurn() {
        return !didMakeMove && // you can only make one move per updateUI.
        currentUpdateUI.move.turnIndexAfterMove >= 0 && // game is ongoing
        currentUpdateUI.yourPlayerIndex === currentUpdateUI.move.turnIndexAfterMove; // it's my turn
    }

    export function isPieceA(row: number, col: number): boolean {
        return state.board[row][col] === 'A';
    }

    export function isPieceB(row: number, col: number): boolean {
        return state.board[row][col] === 'B';
    }

    export function isPieceC(row: number, col: number): boolean {
        return state.board[row][col] === 'C';
    }

    export function isPieceD(row: number, col: number): boolean {
        return state.board[row][col] === 'D';
    }
}

angular.module('myApp', ['gameServices'])
  .run(function () {
    $rootScope['game'] = game;
    game.init();
  });