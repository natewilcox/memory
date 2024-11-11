import Phaser from "phaser";
import { Board } from "../objects/board";
import { MemoryGame } from "../objects/game";
import { ColyseusServerService } from "../services/server";
import { ClientMessages, MessageType } from "../types/messages";

export class Game extends Phaser.Scene {

    private GAME_SIZE = 20;
    private GAME_WIDTH = 5;
    private GAME_HEIGHT = 4;

    private squares: Phaser.GameObjects.Graphics[] = [];
    private labels: Phaser.GameObjects.Text[] = [];

    private block: boolean = false;

    private server!: ColyseusServerService;

    async create() {
        
        this.server = ColyseusServerService.getInstance();
        this.server.configure("http://localhost:2567");
        await this.server.connect("memory_room");

        this.server.onRoomStateChange((room) => {
            this.drawBoard(room.state.numbers);
        });
    }

    drawBoard(numbers: number[]) {

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

                if(numbers[square_index] != -1) {
                    this.labels.push(this.createLabel(x, y, numbers[square_index]));
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

        this.server.send(MessageType.TakeTurn, { i });
    }
}
