describe("aiService",function() {
   it("get best possible move", function() {
       let board = [
      ['A', 'B', 'B', 'C', 'C', 'A', 'A', 'B', 'C'],
      ['C', 'A', 'B', 'B', 'C', 'D', 'D', 'C', 'B'],
      ['A', 'B', 'D', 'C', 'B', 'A', 'A', 'B', 'C'],
      ['C', 'A', 'A', 'D', 'B', 'D', 'D', 'B', 'A'],
      ['D', 'C', 'A', 'C', 'D', 'A', 'B', 'D', 'C'],
      ['D', 'B', 'B', 'A', 'C', 'D', 'A', 'A', 'D'],
      ['A', 'C', 'D', 'D', 'A', 'B', 'B', 'A', 'C'],
      ['D', 'B', 'B', 'C', 'C', 'C', 'A', 'D', 'A'],
      ['A', 'C', 'B', 'C', 'C', 'A', 'A', 'B', 'C']
    ];
    let move : IMove = { 
                turnIndexAfterMove: 1,
                endMatchScores: null,
                  stateAfterMove: {
                    board: board,fromDelta : null,
                     toDelta : null, scores : [0, 0], 
                     completedSteps: [0, 0], 
                     changedDelta : null
                    }
                  }
      let possibleMove : IMove = aiService.findComputerMove(move);
      
      expect(angular.equals(possibleMove.stateAfterMove.fromDelta, {row : 1, col : 8})).toBe(true);
      expect(angular.equals(possibleMove.stateAfterMove.toDelta, {row : 1, col : 7})).toBe(true);
   });
});