import Phaser from 'phaser'
import { LobbyScene } from './scenes/lobby-scene'
import { GameScene } from './scenes/game-scene'
import './style.css'

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  backgroundColor: '#70c5ce',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: '100%',
    height: '100%',
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { x: 0, y: 0 }, debug: true },
  },
  render: {},
  scene: [LobbyScene, GameScene],
}

const game = new Phaser.Game(config)

window.addEventListener('resize', () => {
  const canvas = game.canvas
  const width = window.innerWidth
  const height = window.innerHeight
  const scale = window.devicePixelRatio

  canvas.style.width = width + 'px'
  canvas.style.height = height + 'px'

  game.scale.resize(width * scale, height * scale)
})
