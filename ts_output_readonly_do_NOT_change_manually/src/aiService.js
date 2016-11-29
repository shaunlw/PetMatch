var aiService;
(function (aiService) {
    /**
     * @ move current state of move
     * @ return computer move
     * **/
    function findComputerMove(move) {
        return createComputerMove(move);
    }
    aiService.findComputerMove = findComputerMove;
    /**
     * @ move current state of move
     * @ return move that leads to max score
     **/
    function createComputerMove(move) {
        var aiMove = null;
        var board = move.stateAfterMove.board;
        var fromDelta = null;
        var toDelta = null;
        var possibleMove = gameLogic.getPossibleMove(board);
        var boardTemp = angular.copy(move.stateAfterMove.board);
        try {
            var changedBoardCount = gameLogic.updateBoard(boardTemp, fromDelta, toDelta);
            try {
                aiMove = gameLogic.createMove(move.stateAfterMove, changedBoardCount, move.turnIndexAfterMove);
            }
            catch (e) {
            }
        }
        catch (e) {
        }
        return aiMove;
    }
    aiService.createComputerMove = createComputerMove;
})(aiService || (aiService = {}));
//# sourceMappingURL=aiService.js.map