interface SupportedLanguages {
    en: string, zh: string,
};

interface Translations {
    [index : string] : SupportedLanguages;
}

interface CellSize {
    width : number;
    height : number;
}

interface TopLeft {
  top: number;
  left: number;
}

module game {
    let gameArea : HTMLElement = null;
    let PARAMS : any = gameLogic.PARAMS;
    export let currentUpdateUI: IUpdateUI = null;
    export let didMakeMove: boolean = false; // You can only make one move per updateUI
    export let animationEnded = false;
    export let animationEndedTimeout: ng.IPromise<any> = null;
    export let state: IState = null;
    export let board: Board = null;
    export let dragAndDropStartPos: BoardDelta = null;
    export let dragAndDropElement: HTMLElement = null;

  export function getCurScore(){
    let afterscoresum = 0;
    let beforePlayer0 = 0;
    let beforePlayer1 = 0;
    let afterPlayer0 = 0;
    let afterPlayer1 = 0;
    if (currentUpdateUI.move.stateAfterMove){
      afterPlayer0 = currentUpdateUI.move.stateAfterMove.scores[0];
      afterPlayer1 = currentUpdateUI.move.stateAfterMove.scores[1];
      afterscoresum = afterPlayer0 + afterPlayer1;
    }
    let beforescoresum = 0;
    if (currentUpdateUI.stateBeforeMove){
      beforePlayer0 = currentUpdateUI.stateBeforeMove.scores[0];
      beforePlayer1 = currentUpdateUI.stateBeforeMove.scores[1];
      beforescoresum = beforePlayer0 + beforePlayer1;
    }
    let b = false;
    if (afterPlayer0 - beforePlayer0 > 0){
      b = currentUpdateUI.yourPlayerIndex === 0;
      log.info("scoreby0", currentUpdateUI.yourPlayerIndex);
    }
    else if (afterPlayer1 - beforePlayer1 > 0){
      b = currentUpdateUI.yourPlayerIndex === 1;
      log.info("scoreby1", currentUpdateUI.yourPlayerIndex);
    }
    return afterscoresum-beforescoresum;
  }

    export function getMyScore(): any{//return accumulated scores
        return state.scores[currentUpdateUI.move.turnIndexAfterMove];
    }

    export function shouldShowScore() {
        return !animationEnded && getMyScore() !== 0;
    }
    
    export function getOpponentScore(): any{//return accumulated scores
        return state.scores[1 - currentUpdateUI.move.turnIndexAfterMove];
    }

    export function getTotSteps(): number {//return max steps allowed
        return PARAMS.TOTALSTEPS;
    } 

    export function getMyCompletedSteps (): any {//return steps been completed
        return state.completedSteps[currentUpdateUI.move.turnIndexAfterMove];
    }

    export function getOpponentCompletedSteps (): any {//return steps been completed
        return state.completedSteps[1 - currentUpdateUI.move.turnIndexAfterMove];
    }
    
    function getTranslations(): Translations {
        return {};
    }

    export function init() {
        registerServiceWorker();
        gameArea = document.getElementById("gameArea");
        if (!gameArea) throw new Error("Can't find gameArea!");

        translate.setTranslations(getTranslations());
        translate.setLanguage('en');
        log.log("Translation of 'RULES_OF_PETMATCH' is " + translate('RULES_OF_PETMATCH'));
        resizeGameAreaService.setWidthToHeight(0.777);

        moveService.setGame({
        minNumberOfPlayers: 2,
        maxNumberOfPlayers: 2,
        checkMoveOk: gameLogic.checkMoveOkN,
        updateUI: updateUI,
        gotMessageFromPlatform: null,
        });
        dragAndDropService.addDragListener("gameArea", handleDragEvent);//'gameArea' here refers to the reference variable not the string literal representing the element id.
    }//addDragListener() applies a event monitor to 'gameArea', once mouse hovers over 'gameArea', the monitor collects mouse information (type of event, position of curse) to handleEvent that is implemented by users.

    function getTranslation() : Translations {
        return {
            RULES_OF_PETMATCH : {
                en : "Rules of PetMatch",
                zh : "宠物对对碰游戏规则",
            },
            PET_MATCH_RULES_SLIDE1 : {
                en : "You and your opponent take turns to swap adjacent animals. If you have 3 or over 3 matches over a line, you get score increased according to the number of matches.",
                zh : "你和你的对手轮流进行操作。你需要拖换相邻的宠物。如果拖换之后你得到了三个或者三个以上一样的宠物相连成一条线，连成一条线的宠物数目有多少，你的分数就对应增长多少。",
            }
        };
    }
    export function handleDragEvent(type : string, cx : number, cy : number) {
        log.log("type", type);
        log.log("cx " + cx);
        log.log("cy : " + cy);
        
        //if the user drags cell to outside of the game area, the function will take middle point of the nearest cell        
        let cellSize: CellSize = getCellSize();//cell size changes when you switch device or resize window             
        let x : number = Math.min(Math.max(cx - gameArea.offsetLeft, cellSize.width / 2), gameArea.clientWidth - cellSize.width / 2);//convert absolute position to relative position (relative to parent element)
        let y : number = Math.min(Math.max(cy - gameArea.offsetTop, cellSize.height / 2), gameArea.clientHeight - cellSize.height / 2);//the inner max() takes care if cursor moves to the left or below gameArea. the outer min takes care if cursor moves to the right or top of gameArea
        log.log("x position : " + x);
        log.log("y position : " + y);
        let dragAndDropPos = {
            top : y - cellSize.height * 0.605,
            left : x - cellSize.width * 0.605
        };
        let dragAndDropStart : any;

        //dragging around
        if (type == "touchmove") {
            if (dragAndDropPos) setDragAndDropElementPos(dragAndDropPos, cellSize);
            return;
        }
        //get the index of cell based on current pos (cx, cy). identify cell based on mouse position
        let delta : BoardDelta = {
            row : Math.floor(PARAMS.ROWS * y / gameArea.clientHeight),
            col : Math.floor(PARAMS.COLS * x / gameArea.clientWidth)
        };
        log.log(delta);
        if (type == "touchstart"){//if mouse pressed down
            dragAndDropStartPos = delta;//save start cell, because a new delta will be calculated once pressed mouse is moved.
            dragAndDropStart = dragAndDropPos;
            dragAndDropElement = document.getElementById("img_container_" + dragAndDropStartPos.row + "_" + dragAndDropStartPos.col);
            let style: any = dragAndDropElement.style;
            style['z-index'] = 200;
            setDragAndDropElementPos(dragAndDropPos, cellSize);
            return;
        }
        
        if (type == "touchend" && dragAndDropStartPos) {//if mouse released from a drag
            let fromDelta = {
                row : dragAndDropStartPos.row,
                col : dragAndDropStartPos.col
            };
            let toDelta = {
                row : delta.row,//new delta is calculated based on new cursor position
                col : delta.col
            };
            let nextMove : IMove = null;
            if (dragOk(fromDelta, toDelta)) {//if human turn
                     //let changedBoardCount : BoardCount = gameLogic.updateBoard(state.board, fromDelta, toDelta);
                     try {//calculate next move, if ilegal then report error.
                         nextMove = gameLogic.createMove(state, fromDelta, toDelta, currentUpdateUI.move.turnIndexAfterMove);
                        } catch (e) {
                            log.info(["Move is illegal:", e]);
                            endDragAndDrop();//move back to original position
                            return;
                        }
                makeMove(nextMove);//make legal move
            }
        }
        if (type === "touchend" || type === "touchcancel" || type === "touchleave") {
            endDragAndDrop();
        }
    }//end handleDragEvent()

    function getCellSize() : CellSize {//calculate cell size, which varies on different devices.
        return {
            width : gameArea.clientWidth / PARAMS.COLS,//gameArea.clientWidth is the width of the html body.
            height : gameArea.clientHeight / PARAMS.ROWS
        };
    }
    
    /**
   * Set the TopLeft of the element.
   */
  function setDragAndDropElementPos(pos: TopLeft, cellSize: CellSize): void {
    let style: any = dragAndDropElement.style;
    let top: number = cellSize.height / 10;
    let left: number = cellSize.width / 10;
    let originalSize = getCellPos(dragAndDropStartPos.row, dragAndDropStartPos.col, cellSize);
    let deltaX: number = (pos.left - originalSize.left + left);
    let deltaY: number = (pos.top - originalSize.top + top);
    // make it 20% bigger (as if it's closer to the person dragging).
    let transform = "translate(" + deltaX + "px," + deltaY + "px) scale(1.2)";
    style['transform'] = transform;
    style['-webkit-transform'] = transform;
    style['will-change'] = "transform"; // https://developer.mozilla.org/en-US/docs/Web/CSS/will-change
  }

 /**
  * Get the position of the cell.
  **/
  function getCellPos(row: number, col: number, cellSize: CellSize): TopLeft {
    let top: number = row * cellSize.height;
    let left: number = col * cellSize.width;
    let pos: TopLeft = {top: top, left: left};
    return pos;
  }

  function animationEndedCallback() {
    log.info("Animation ended");
    maybeSendComputerMove();
    animationEnded = true;
  }
  function clearAnimationTimeout() {
    if (animationEndedTimeout) {
      $timeout.cancel(animationEndedTimeout);
      animationEndedTimeout = null;
    }
  }  

    export function updateUI(params: IUpdateUI): void {
    log.info("Game got updateUI :", params);
    animationEnded = false;
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

   function maybeSendComputerMove() {
       if (!isComputerTurn()) return;
       let move = aiService.findComputerMove(currentUpdateUI.move);
       log.info("Computer move: ", move);
       makeMove(move);
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
        if (dragAndDropElement) dragAndDropElement.removeAttribute("style");
        dragAndDropElement = null;
    }

    export function getMoveDownClass(row: number, col: number): string {//find out how many steps a ball,if needed, should move down
        let res = 0;
        if (state.changedDelta){//if there is at least one modified cell
        for (let i = 0; i < state.changedDelta.length; i++) {//for each modified cell
            if (state.changedDelta[i].row >= row && state.changedDelta[i].col === col) {//only need to move if the modified cell is below you (bigger row # and same col #)
                res++;//sum up how many cells below you have been modified; this is the number of steps you need to move down.
            }
        }
        }
        // log.info("test it out", row, col, res, state.changedDelta);
        if (res !== 0 && state.changedDelta)//you [(raw,col) passed to this function] cam move down only if: 1. there is modified cells below you and 2. animation has not been marked as finished.
        return 'movedown'+res;//return how many steps you need to move down
        return '';//you don't need to move'
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

  export function isMyTurn() {
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
    $rootScope['game'] = game;//create a subscope in rootscope and name it 'game', asign it with the herein defined 'game'module
    game.init();//does this get run before rendering the view? i.e. can dom display values created by this ini()?
  });