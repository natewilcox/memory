import Phaser from "phaser";
import { ColyseusServerService } from "../services/server";
import { MessageType } from "../types/messages";

export class Game extends Phaser.Scene {

    private squares: Phaser.GameObjects.Graphics[] = [];
    private labels: Phaser.GameObjects.Text[] = [];

    private server!: ColyseusServerService;
    private server_host = import.meta.env.VITE_HOST;

    async create() {
        
        this.server = ColyseusServerService.getInstance();
        this.server.configure(this.server_host);
        await this.server.connect("memory_room");

        this.server.onRoomStateChange((room) => {
            this.drawBoard(room.state);
        });
    }

    drawBoard(state: any) {

        const numbers: number[] = state.numbers;
        const answerers: string[] = state.answerer;
        const states: number[] = state.number_state;
        
        this.clearBoard();
      
        const gameW = this.game.canvas.width;
        const gameH = this.game.canvas.height;

        const gameX = (gameW/2) - ((160*4)/2);
        const gameY = (gameH/2) - ((160*5)/2);

        const squareSize = 150;
        let i = 0;

        for(let r=0; r<5; r++) {
            for(let c=0; c<4; c++) {

                const x = (160*c) + gameX;
                const y = (160*r) + gameY;
                const square_index = i;
                const number = numbers[square_index];
                const owner = answerers[square_index];
                const isMine = owner == this.server.SessionID;

                let square_bg = 0xffffff;
                if(owner != "") {
                    square_bg = isMine ? 0x98cf7e : 0xcf7e7e;
                }

                const hitArea = new Phaser.Geom.Rectangle(x, y, squareSize, squareSize);
                const square = this.add.graphics();
                square.setDataEnabled();
                square.fillStyle(square_bg, 1);
                square.fillRoundedRect(x, y, squareSize, squareSize, 10);
                square.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
                square.on('pointerdown', () => this.squareClickedHandler(square_index));
        
                square.data.set('color', 0xffffff);
                this.squares.push(square);

                if(states[square_index] == 1) {
                    this.flash(square, x, y);
                }

                if(numbers[square_index] != -1) {
                    const text = this.add.text(x + 80, y + 80, number+ "", {
                        color: 'black',
                        fontSize: '120px'
                    }).setOrigin(0.5, 0.5);

                    this.labels.push(text);
                }

                i++;
            }
        }

        const player_count = this.add.text(gameW/2, 100, `players: ${state.players.length}`, {
            fontSize: '20px'
        }).setOrigin(0.5, 0.5);
        this.labels.push(player_count);

        const status_text = this.server.SessionID == state.activePlayer ? "Your Turn" : "Their Turn";
        const status = this.add.text(gameW/2, 150, status_text, {
            fontSize: '40px'
        }).setOrigin(0.5, 0.5);
        this.labels.push(status);

        const unanswered = answerers.some(a => a == "");

        if(!unanswered) {
            const restart = this.add.text(gameW/2, gameH-200, "Tap to restart", {
                fontSize: '60px'
            }).setOrigin(0.5, 0.5);
    
            restart.setInteractive();
            restart.on('pointerdown', () => this.restartClickedHandler());
            this.labels.push(restart);
        }
    }

    clearBoard() {
        this.labels.forEach(label => label.destroy());
        this.squares.forEach(square => square.destroy());
    }

    private restartClickedHandler() {
        this.server.send(MessageType.Restart);
    }

    private squareClickedHandler(i: number) {
        this.server.send(MessageType.TakeTurn, { i });
    }

    private flash(square: Phaser.GameObjects.Graphics, x: number, y: number) {
   
        if(square == null || square.data == null) {
            return;
        }

        square.clear();

        if(square.data.get('color') == 0xffffff) {
        
            square.data.set('color', 0xcf7e7e);
            square.fillStyle(0xcf7e7e, 1);
        }
        else {
            square.data.set('color', 0xffffff);
            square.fillStyle(0xffffff, 1);
        }

        square.fillRoundedRect(x, y, 150, 150, 10);

        if(square.active) {
            this.time.delayedCall(10, () => this.flash(square, x, y));
        }
    }
}
