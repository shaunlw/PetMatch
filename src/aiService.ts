module aiService {
    
    /** 
     * @ move current state of move
     * @ return computer move 
     * **/
    export function findComputerMove(move : IMove) : IMove {
        return createComputerMove(move);
    }

    /**
     * @ move current state of move 
     * @ return move that leads to max score
     **/
    export function createComputerMove(move : IMove) : IMove{
        let aiMove : IMove = null;
        let board = move.stateAfterMove.board;
        let fromDelta : BoardDelta = null;
        let toDelta : BoardDelta = null;
        let possibleMove : petSwitch = gameLogic.getPossibleMove(board);

        let boardTemp = angular.copy(move.stateAfterMove.board);
        try {
            let changedBoardCount : BoardCount = gameLogic.updateBoard(boardTemp, fromDelta, toDelta);
            try {
                aiMove = gameLogic.createMove(move.stateAfterMove, changedBoardCount, move.turnIndexAfterMove);
            } catch (e) {
            }
        } catch (e) {
        }
        return aiMove;
    }

}