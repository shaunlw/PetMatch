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
     * @ return move that leads to maximum score
     **/
    function createComputerMove(move) {
        var aiMove = null;
        var board = move.stateAfterMove.board;
        var possibleMove = gameLogic.getPossibleMove(board);
        try {
            aiMove = gameLogic.createMove(move.stateAfterMove, possibleMove.fromDelta, possibleMove.toDelta, move.turnIndexAfterMove);
        }
        catch (e) {
        }
        return aiMove;
    }
    aiService.createComputerMove = createComputerMove;
})(aiService || (aiService = {}));
//# sourceMappingURL=aiService.js.map