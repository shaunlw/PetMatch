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
         * @ return move that leads to maximum score
         **/
        export function createComputerMove(move : IMove) : IMove{
            let aiMove : IMove = null;
            let board = move.stateAfterMove.board;
            let possibleMove : petSwitch = gameLogic.getPossibleMove(board);
            try {
                aiMove = gameLogic.createMove(move.stateAfterMove, possibleMove.fromDelta, possibleMove.toDelta, move.turnIndexAfterMove);
            } catch (e) {
            }
            return aiMove;
        }
    }