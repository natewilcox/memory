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
        const squareSize = (gameW-50) / 4;

        //draw header
        const header_footer_height = ((gameH - (squareSize*5) - 60)/2)-15;
        const header = this.add.graphics();
        header.fillStyle(0xffffff, 1);
        header.fillRoundedRect(10, 10, gameW - 20, header_footer_height, 10);

        let status_text = this.server.SessionID == state.activePlayer ? "Your Turn" : "Their Turn";
        let header_text = state.players.length == 1 ? "Solo" : `PvP - ${status_text}`;

        const is_game_active = answerers.some(a => a == "");

        if (!is_game_active) {

            const my_score = answerers.filter(a => a == this.server.SessionID).length;

            header_text = my_score == 10 ? "Tie" : my_score > 10 ? "You Win" : "You Lose";
            status_text = "";
        }

        const player_count = this.add.text(20, header_footer_height/2, header_text, {
            fontSize: `${header_footer_height*.55}px`,
            color: 'black',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        this.labels.push(player_count);

        //draw footer
        const footer = this.add.graphics();
        footer.fillStyle(0xffffff, 1);
        footer.fillRoundedRect(10, gameH-header_footer_height-20, gameW - 20, header_footer_height, 10);

        if (!is_game_active) {
            const restart = this.add.text(gameW / 2, gameH - (header_footer_height/2), "Tap to restart", {
                fontSize: `${header_footer_height*.55}px`,
                color: 'black',
                fontFamily: 'Arial',
                fontStyle: 'bold'
            }).setOrigin(0.5, 1);

            restart.setInteractive();
            restart.on('pointerdown', () => this.restartClickedHandler());
            this.labels.push(restart);
        }

        //draw grid
        const gameX = (gameW / 2) - (((squareSize+10) * 4) / 2) + 5;
        const gameY = (gameH / 2) - (((squareSize+10) * 5) / 2);
        let i = 0;

        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 4; c++) {

                const x = ((squareSize+10) * c) + gameX;
                const y = ((squareSize+10) * r) + gameY;
                const square_index = i;
                const number = numbers[square_index];
                const owner = answerers[square_index];
                const isMine = owner == this.server.SessionID;

                let square_bg = 0xffffff;
                if (owner != "") {
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

                if (states[square_index] == 1) {
                    this.flash(square, x, y, squareSize);
                }

                if (numbers[square_index] != -1) {
                    const text = this.add.text(x + (squareSize/2), y + (squareSize/2), number + "", {
                        color: 'black',
                        fontSize: '60px',
                        fontFamily: 'Arial',
                        fontStyle: 'bold'
                    }).setOrigin(0.5, 0.5);

                    this.labels.push(text);
                }

                i++;
            }
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

    private flash(square: Phaser.GameObjects.Graphics, x: number, y: number, w: number) {

        if (square == null || square.data == null) {
            return;
        }

        square.clear();

        if (square.data.get('color') == 0xffffff) {

            square.data.set('color', 0xcf7e7e);
            square.fillStyle(0xcf7e7e, 1);
        }
        else {
            square.data.set('color', 0xffffff);
            square.fillStyle(0xffffff, 1);
        }

        square.fillRoundedRect(x, y, w, w, 10);

        if (square.active) {
            this.time.delayedCall(10, () => this.flash(square, x, y, w));
        }
    }
}
