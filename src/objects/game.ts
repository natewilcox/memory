import { Board } from "./board";

export class MemoryGame {

    private _board: Board;
    private _prevGuess: number;

    constructor(board: Board) {
        this._board = board;
        this._prevGuess = -1;
    }

    get board(): Board {
        return this._board;
    }

    guess(i: number, endTurn: () => void) {

        if(this.board.isVisible(i)) {
            console.log("pick something else");
            return;
        }
        
        this._board.setVisible(i);

        if(this._prevGuess == -1) {
            this._prevGuess = i;
        }
        else {

            const a = this.board.get(i);
            const b = this.board.get(this._prevGuess);

            this.board.setRight(i, a == b);
            this.board.setRight(this._prevGuess, a == b);

            this._prevGuess = -1;

            endTurn();
        }
    }

    public hideWrong() {
        this.board.hideAllWrong();
    }
}