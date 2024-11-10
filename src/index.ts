import Phaser from 'phaser';
import { Board } from './scenes/board';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: Board,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
    },
  },
};

const game = new Phaser.Game(config);
