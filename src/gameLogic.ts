type Board = string[][];
interface BoardDelta {
    row : number;
    col : number;
}
interface lineDelta {
  startDelta : BoardDelta;
  endDelta : BoardDelta;
}
interface BoardCount{
  board : Board;
  count : number;
}

interface petSwitch {
  fromDelta : BoardDelta,
  toDelta : BoardDelta
}
 /** 
  * Record the state of current player.
  **/
interface IState {
  board : Board;
  fromDelta : BoardDelta;
  toDelta : BoardDelta;
  //score for players of corresponding index 
  scores : number[];
  completedSteps : number[];
  boardCount : BoardCount;
}

module gameLogic {
  
  export const PARAMS : any = {
    ROWS : 9,
    COLS : 9,
    TOTALSTEPS : 15
  };
  const NUM_PLAYERS = 2;

  /**
   * @ Return the initial PetMatch board.
   *   a ROWSxCOLS matrix containing four types of pets. 
   **/
  export function getInitialBoard() : Board {
    
    let board : Board = [
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
    //window.alert(Math.floor(Math.random() * 4 + 1));
    //let board : Board = getRandomBoard(); 
    return board;
  }

  function getRandomBoard() : Board{
    let board :Board = [];
    for (let i = 0; i < PARAMS.ROWS; i++) {
      board[i] = [];
      for (let j = 0; j < PARAMS.COLS; j++) {
        board[i][j] = getRandomPet();
      }  
    }
    return board;
  }

  function getRandomPet() : string {
    let ans = "";
    let randPet = Math.floor(Math.random() * 4 + 1);
    if (randPet == 1) {
      ans = 'A';
    } else if (randPet == 2) {
      ans = 'B';
    } else if (randPet == 3) {
      ans = 'C';
    } else {
      ans = 'D';
    }
    return ans;
  }

  export function getInitialState() : IState {
    let scores : number[] = [];
    for (let i = 0; i < NUM_PLAYERS; i++) {
      scores[i] = 0;
    }
    return {
      board : getInitialBoard(), 
      fromDelta : null,
      toDelta : null,
      scores : scores,
      completedSteps : [0,0],
      boardCount : null
    };
  }

  export function createInitialMove() : IMove {
    return {
      endMatchScores: null, 
      turnIndexAfterMove: 0, 
      stateAfterMove: getInitialState()
    };  
  }

  /**
   * @ Return boolean value indicating whether there is a tie.
   * @ Param current state values.
   **/
  function isTie(curState: IState): boolean {
    let steps = curState.completedSteps;
    let scores = curState.scores;
    if (steps >= PARAMS.TOTALSTEPS && haveDuplicateScores(scores)) {
      return true;
    }
    return false;
  }

  function haveDuplicateScores (scores : number[]) : boolean {
    let counts : any = {};
    for (let i = 0; i < scores.length; i++) {
      if (counts[scores[i]]) {
        return true;
      } else {
        counts[scores[i]] = 1;
      }
    }
    return false;
  }

  /**
   * @ Return The index of the winner with max score.
   **/
  function getWinner(curState : IState) : number {
    let scores = curState.scores;
    let max = 0;
    let maxIndex = -1;
    if (curState.completedSteps[0] >= PARAMS.TOTALSTEPS && curState.completedSteps[1] >= PARAMS.TOTALSTEPS) {
      for ( let i = 0; i < scores.length; i++) {
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
   export function getMatch(board : Board, fromDelta : BoardDelta, toDelta : BoardDelta) : lineDelta[] {
    
    let match : lineDelta[] = [];
    /*
    let COLL : number = Math.min(fromDelta.col, toDelta.col);
    let COLR : number = Math.max(fromDelta.col, toDelta.col);
    let ROWL : number = Math.min(fromDelta.row, toDelta.row);
    let ROWR : number = Math.max(fromDelta.col, toDelta.col); */
    let i : number = 0;
   
    //swap on temp board
    let petFrom : string = board[fromDelta.row][fromDelta.col];
    board[fromDelta.row][fromDelta.col] = board[toDelta.row][toDelta.col];
    board[toDelta.row][toDelta.col] = petFrom;
    //check alignment for pet currently in fromIndex
    let target : string = board[fromDelta.row][fromDelta.col];
    let count : number = 1;
     let startDelta : BoardDelta = {
      row : 0,
      col : 0
    };
    let endDelta : BoardDelta = {
      row : 0,
      col : 0
    }; 
    startDelta.row = fromDelta.row;
    endDelta.row = fromDelta.row;
    let col : number = fromDelta.col;
    for (col = fromDelta.col + 1; col < PARAMS.COLS; col++) {
      if (board[fromDelta.row][col] === target) {
        count++;
      } else {
        break;
      }
    }
    endDelta.col = col - 1;
   // window.alert("end col " + endDelta.col);
    for (col = fromDelta.col - 1; col >= 0; col--) {
      if (board[fromDelta.row][col] === target) {
        count++;
      } else {
        break;
      }
    }
    startDelta.col = col + 1;
    //window.alert("start col " + startDelta.col);
    //window.alert("count " + count);
    if (count >= 3) {
      let lDelta :lineDelta = {
        startDelta : startDelta,
        endDelta : endDelta
      }
      match[i++] = lDelta;
      //window.alert(" row " + startDelta.row);
      //window.alert("start col " + startDelta.col);
      //window.alert("end col " + endDelta.col);
    }
    
    startDelta = angular.copy(startDelta);
    endDelta = angular.copy(endDelta);
    startDelta.col = fromDelta.col;
    endDelta.col = fromDelta.col;
    count = 1;
    let row : number = fromDelta.row;
    for (row  = fromDelta.row + 1; row < PARAMS.ROWS; row++) {
      if (board[row][fromDelta.col] === target) {
        count++;
      } else {
        break;
      }
    }
    endDelta.row = row - 1;
    for (row = fromDelta.row - 1; row >= 0; row--) {
      if (board[row][fromDelta.col] === target) {
        count++;
      } else {
        break;
      }
    }
    startDelta.row = row + 1;
    if (count >= 3) {
      let lDelta :lineDelta = {
        startDelta : startDelta,
        endDelta : endDelta
      }
      match[i++] = lDelta;
      //window.alert("col  " + startDelta.col);
      //window.alert("start row " + startDelta.row);
      //window.alert("end row " + endDelta.row);
    }

    //check check alignment for pet currently in toIndex
    target = board[toDelta.row][toDelta.col];
    count = 1;
    col = toDelta.col;
    startDelta = angular.copy(startDelta);
    endDelta = angular.copy(endDelta);
    startDelta.row = toDelta.row;
    endDelta.row = toDelta.row;
    for (col = toDelta.col + 1; col < PARAMS.COLS; col++) {
      if (board[toDelta.row][col] === target) {
        count++;
      } else {
        break;
      }
    }
    endDelta.col = col - 1;
    for (col = toDelta.col - 1; col >= 0; col--) {
      if (board[toDelta.row][col] === target) {
        count++;
      } else {
        break;
      }
    }
    startDelta.col = col + 1;
    if (count >= 3 ) {
      let lDelta :lineDelta = {
        startDelta : startDelta,
        endDelta : endDelta
      }
      match[i++] = lDelta;
      //window.alert("row " + startDelta.row);
      //window.alert("start col " + startDelta.col);
      //window.alert("end col " + endDelta.col);
    }

    count = 1;
    startDelta = angular.copy(startDelta);
    endDelta = angular.copy(endDelta);
    startDelta.col = toDelta.col;
    endDelta.col = toDelta.col;
    for (row = toDelta.row + 1; row < PARAMS.ROWS; row++) {
      if (board[row][toDelta.col] === target) {
        count++;
      } else {
        break;
      }
    }
    endDelta.row = row - 1;
    for (row = toDelta.row - 1; row >= 0; row--) {
      if (board[row][toDelta.col] === target) {
        count++;
      } else {
        break;
      }
    }
    startDelta.row = row + 1;

    if (count >= 3) {
      let lDelta :lineDelta = {
        startDelta : startDelta,
        endDelta : endDelta
      }
      match[i++] = lDelta;
      //window.alert("col  " + startDelta.col);
      //window.alert("start row " + startDelta.row);
      //window.alert("end row " + endDelta.row);
    }
    return match;
  }

function shouldShuffle(board : Board) : boolean {
  let petsToSwitch : petSwitch = getPossibleMove(board);
  if (petsToSwitch.fromDelta.row ===  petsToSwitch.toDelta.row 
        && petsToSwitch.fromDelta.col ===  petsToSwitch.toDelta.col) {
          return true;
        }
  return false;
}

function shuffle() : Board {
  return getRandomBoard();
}

export function getPossibleMove(board : Board) : petSwitch{
        let boardTemp = angular.copy(board);
        let deltaF : BoardDelta = {
            row : 0,
            col : 0
        };
        let deltaT : BoardDelta = {
            row : 0,
            col : 0
        };
        let deltaFrom : BoardDelta = {
            row : 0,
            col : 0
        };
        let deltaTo: BoardDelta = {
            row : 0,
            col : 0
        };
        let match : lineDelta[] = [];

        for (let i = 0; i < gameLogic.PARAMS.ROWS; i++) {
            deltaF.row = i;
            deltaT.row = i;
            for (let j = 1; j < gameLogic.PARAMS.COLS; j++) {
                deltaF.col = j;
                deltaT.col = j - 1;
                let tpMatch : lineDelta[] = gameLogic.getMatch(boardTemp, deltaF, deltaT);
                if (getMatchSize(tpMatch) > getMatchSize(match)) {
                    match = tpMatch;
                    deltaFrom.row = deltaF.row;
                    deltaFrom.col = deltaF.col;
                    deltaTo.row = deltaT.row;
                    deltaTo.col = deltaT.col;
                }
            }
        }
        for (let i = 0; i < gameLogic.PARAMS.COLS; i++) {
            deltaF.col = i;
            deltaT.col = i;
            for (let j = 1; j < gameLogic.PARAMS.ROWS; j++) {
                deltaF.row = j;
                deltaT.row = j - 1;
                let tpMatch : lineDelta[] = gameLogic.getMatch(boardTemp, deltaF, deltaT);
                if (getMatchSize(tpMatch) > getMatchSize(match)) {
                    match = tpMatch;
                    deltaFrom.row = deltaF.row;
                    deltaFrom.col = deltaF.col;
                    deltaTo.row = deltaT.row;
                    deltaTo.col = deltaT.col;
                }
            }
        }
        let possibleMove : petSwitch = {
            fromDelta : deltaFrom,
            toDelta : deltaTo
        }
        return possibleMove;
    }
    
    function getMatchSize(match : lineDelta[]) : number {
        let count : number = 0;
        for (let i = 0; i < match.length; i++) {
            let matchI : lineDelta = match[i];
            count += matchI.endDelta.row - matchI.startDelta.row + matchI.endDelta.col - matchI.startDelta.col;
        }
        return count;
    }

/** 
 * Find match of 3 and over 3, update board
 * @ board board before update
 * @ return board after update
 **/
export function updateBoard(board : Board, fromDelta : BoardDelta, toDelta : BoardDelta) : BoardCount {
  if (shouldShuffle(board)) {
      board = shuffle();
    }
    //let board: Board = stateBeforeMove.board;
  let boardTemp = angular.copy(board);
  let match : lineDelta[] = getMatch(boardTemp, fromDelta, toDelta);
  if (!match || match.length === 0) {
    throw new Error("Can only make a move for pet matches of 3 or over 3!");
  }
  //window.alert(match.length);
  let count : number = 0;
  //mark elements to be removed
  let visited : boolean[][] = [];
  for (let row = 0; row < PARAMS.ROWS; row++) {
    visited[row] = [];
    for (let col = 0; col < PARAMS.COLS; col++) {
      visited[row][col] = false;
    }
  }
  for (let i = 0; i < match.length; i++) {
    let line : lineDelta = match[i];
    if (!line) {
      throw new Error("line is empty!");   
    }
    if (line.startDelta.row === line.endDelta.row) {
      let row : number = line.startDelta.row;
      //window.alert("row " + row);
      //window.alert("start col " + line.startDelta.col + " end col " + line.endDelta.col);
      for (let col : number = line.startDelta.col; col <= line.endDelta.col; col++)  {
         //window.alert("cell1 " + " row " + row + " col " + col)
        if (!visited[row][col]) {
          visited[row][col] = true;
          //window.alert("cell " + " row " + row + " col " + col);
          count++;
        }
      }
    } else if (line.startDelta.col === line.endDelta.col) {
      let col : number = line.startDelta.col;
      for (let row : number = line.startDelta.row; row <= line.endDelta.row; row++)  {
        if (!visited[row][col]) {
          visited[row][col] = true;
          count++;
        }
      }
    } else {
          throw new Error("Error in getting match, should have same col or row!");   
    }
  }
  //initialize
  let newBoard : Board = [];
  for (let row = 0; row < PARAMS.ROWS; row++) {
    newBoard[row] = [];
    for (let col = 0; col < PARAMS.COLS; col++) {
      newBoard[row][col] = "";
    }
  }
  //update
  for (let col = 0; col < PARAMS.COLS; col++) {
    let newRow : number = PARAMS.ROWS - 1;
    for (let row = PARAMS.ROWS - 1; row >= 0; row--) {
      if (!visited[row][col]) {
        newBoard[newRow][col] = board[row][col];
        newRow--;
      }
    }
  }
  for (let row = 0; row < PARAMS.ROWS; row++) {
    for (let col = 0; col < PARAMS.COLS; col++) {
      if (!newBoard[row][col]) {
        newBoard[row][col] = getRandomPet();
      }
    }
  }
  return {
    board : newBoard,  
    count : count
  };
}

/** 
 * @ params stateAfterMove state before make move
 * @ return state after make move
 * **/
function checkBoard(stateBeforeMove : IState, turnIndexBeforeMove : number, boardCount : BoardCount) : IState {
  //switch pets with pos of fromDelta and toDelta
  let fromDelta : BoardDelta = stateBeforeMove.fromDelta;
  let toDelta : BoardDelta = stateBeforeMove.toDelta;
  let board : Board = angular.copy(stateBeforeMove.board);
  let tmpStr : string = board[fromDelta.row][fromDelta.col];
  board[fromDelta.row][fromDelta.col] = board[toDelta.row][toDelta.col];
  board[toDelta.row][toDelta.col] = tmpStr;
  //remove match >= 3, update score and board 
  let stateAfterMove : IState = angular.copy(stateBeforeMove);
  
  stateAfterMove.board = boardCount.board;
  stateAfterMove.scores[turnIndexBeforeMove] = stateBeforeMove.scores[turnIndexBeforeMove] + boardCount.count * 10;
  stateAfterMove.boardCount = boardCount;
  stateAfterMove.completedSteps[turnIndexBeforeMove] = stateBeforeMove.completedSteps[turnIndexBeforeMove] + 1;
  return stateAfterMove;
}

/**
* @ Return the move that should be performed when player
* with index turnIndexBeforeMove makes a move in cell row X col.
**/
  export function createMove(
      stateBeforeMove : IState, changedBoardCount : BoardCount, turnIndexBeforeMove : number): IMove {
    if (!stateBeforeMove) {
      stateBeforeMove = getInitialState();
    }
    let fromDelta : BoardDelta = stateBeforeMove.fromDelta;
    let toDelta : BoardDelta = stateBeforeMove.toDelta;
    
    //let scores : number[] = stateBeforeMove.scores;
    if (getWinner(stateBeforeMove) !== -1 || isTie(stateBeforeMove)) {
      throw new Error("Can only make a move if the game is not over!");
    }
    if (fromDelta.row !== toDelta.row && fromDelta.col !== toDelta.col) {
      throw new Error("Can only swap adjacent pets!");
    }
    
    //get state after movement 
    let stateAfterMove : IState = checkBoard(stateBeforeMove, turnIndexBeforeMove, changedBoardCount);

    let winner = getWinner(stateAfterMove);
    let endMatchScores : number[];
    let turnIndexAfterMove : number;
    if (winner !== -1 || isTie(stateAfterMove)) {
      // Game over.
      turnIndexAfterMove = -1;
      endMatchScores = winner === 0 ? [1, 0] : winner === 1 ? [0, 1] : [0, 0];
    } else {
      // Game continues. Now it's the opponent's turn (the turn switches from 0 to 1 and 1 to 0).
      turnIndexAfterMove = 1 - turnIndexBeforeMove;
      endMatchScores = null;
    }
    return {endMatchScores: endMatchScores, turnIndexAfterMove: turnIndexAfterMove, stateAfterMove: stateAfterMove};
  }

   export function checkMoveOk(stateTransition: IStateTransition): void {
    // We can assume that turnIndexBeforeMove and stateBeforeMove are legal, and we need
    // to verify that the move is OK.
    let turnIndexBeforeMove = stateTransition.turnIndexBeforeMove;
    let stateBeforeMove: IState = stateTransition.stateBeforeMove;
    let move: IMove = stateTransition.move;
    if (!stateBeforeMove && turnIndexBeforeMove === 0 &&
        angular.equals(createInitialMove(), move)) {
      return;
    }
    let boardCount : BoardCount = stateTransition.move.stateAfterMove.boardCount;
    let expectedMove = createMove(stateBeforeMove , boardCount, turnIndexBeforeMove);
    if (!angular.equals(move, expectedMove)) {
      throw new Error("Expected move=" + angular.toJson(expectedMove, true) +
          ", but got stateTransition=" + angular.toJson(stateTransition, true))
    } 
  }


  export function forSimpleTestHtml() {
  let line1 : lineDelta = {
    startDelta : {
      row : 5,
      col : 5
    },
    endDelta : {
      row : 8,
      col : 5
    }
  }
  let lines : lineDelta[] = [];
  lines[0] = line1;
  let board : Board = getInitialBoard();
  }
}
