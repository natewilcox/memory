import Phaser from "phaser";
import { Board } from "../objects/board";
import { MemoryGame } from "../objects/game";

export class Game extends Phaser.Scene {

    private GAME_SIZE = 20;
    private GAME_WIDTH = 5;
    private GAME_HEIGHT = 4;

    private memoryGame!: MemoryGame;
    private squares: Phaser.GameObjects.Graphics[] = [];
    private labels: Phaser.GameObjects.Text[] = [];

    private block: boolean = false;

    create() {
        
        const layout = Board.generateLayout(this.GAME_SIZE);
        const board = new Board(layout);

        this.memoryGame = new MemoryGame(board)
        this.drawBoard();
    }

    drawBoard() {

        this.clearBoard();

        const gameW = this.game.canvas.width;
        const gameH = this.game.canvas.height;

        const gameX = (gameW/2) - ((160*5)/2);
        const gameY = (gameH/2) - ((160*4)/2);

        const squareSize = 150;
        let i = 0;

        for(let r=0; r<this.GAME_HEIGHT; r++) {
            for(let c=0; c<this.GAME_WIDTH; c++) {

                const x = (160*c) + gameX;
                const y = (160*r) + gameY;
                const square_index = i;
                const square = this.createSquare(x, y, 150, () => this.squareClickedHandler(square_index));
                this.squares.push(square);

                if(this.memoryGame.board.isVisible(square_index)) {
                    this.labels.push(this.createLabel(x, y, this.memoryGame.board.get(square_index)));
                }

                i++;
            }
        }
    }

    clearBoard() {
        this.labels.forEach(label => label.destroy());
        this.squares.forEach(square => square.clear());
    }

    private createLabel(x: number, y: number, val: number) {

        const text = this.add.text(x + 80, y + 80, val+ "", {
            color: 'black',
            fontSize: '120px'
        }).setOrigin(0.5, 0.5);

        return text;
    }

    private createSquare(x: number, y: number, size: number, cb: () => void) {

        const square = this.add.graphics();

        square.fillStyle(0xffffff, 1);
        square.fillRect(x, y, size, size);

        const hitArea = new Phaser.Geom.Rectangle(x, y, size, size);
        square.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
        square.on('pointerdown', cb);

        return square;
    }

    private squareClickedHandler(i: number) {

        if(this.block) {
            return;
        }

        this.memoryGame.guess(i,
            () => {
                this.block = true;
                this.time.addEvent({
                    delay: 1000,
                    callback: () => {

                        this.memoryGame.hideWrong();
                        this.drawBoard();
                        this.block = false;
                    },
                    callbackScope: this
                })
            }
        );

        this.drawBoard();
    }
}
