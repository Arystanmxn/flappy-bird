import Phaser from 'phaser'
import { birdSkins } from '../consts/bird-skins.consts'
import { pipesSkins } from '../consts/pipes-skins.consts'

export class LobbyScene extends Phaser.Scene {
  private selectedBirdSkin: string = 'uzbekistan'
  private selectedPipeSkin: string = 'soap'
  private skinFrames: Phaser.GameObjects.Rectangle[] = []
  private scrollArea!: Phaser.GameObjects.Container
  //   private activeTab: 'bird' | 'pipe' = 'bird'

  constructor() {
    super('LobbyScene')
  }

  preload() {
    birdSkins.forEach((skin) => {
      this.load.image(skin.name, skin.image)
    })
    pipesSkins.forEach((skin) => {
      this.load.image(skin.name, skin.image)
    })
  }

  create() {
    const { width, height } = this.scale

    this.add
      .text(width / 2, 60, 'Choose your skin', {
        fontSize: '32px',
        color: '#ffffff',
      })
      .setOrigin(0.5)

    // --- Вкладки ---
    const birdTab = this.add
      .text(width / 2 - 100, 100, 'Birds 🐦', {
        fontSize: '28px',
        color: '#ffff00',
        backgroundColor: '#00000055',
        padding: { x: 15, y: 8 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })

    const pipeTab = this.add
      .text(width / 2 + 100, 100, 'Pipes 🚧', {
        fontSize: '28px',
        color: '#ffffff',
        backgroundColor: '#00000055',
        padding: { x: 15, y: 8 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })

    // --- Контейнер с прокруткой ---
    this.scrollArea = this.add.container(0, 160)
    let scrollY = 0

    this.input.on('wheel', (_p: any, _g: any, _dx: any, dy: number) => {
      scrollY = Phaser.Math.Clamp(scrollY - dy, -400, 0)
      this.scrollArea.y = 160 + scrollY
    })

    // Рендерим птиц по умолчанию
    this.renderSkins('bird')

    birdTab.on('pointerdown', () => {
      //   this.activeTab = 'bird'
      birdTab.setColor('#ffff00')
      pipeTab.setColor('#ffffff')
      this.renderSkins('bird')
    })

    pipeTab.on('pointerdown', () => {
      //   this.activeTab = 'pipe'
      birdTab.setColor('#ffffff')
      pipeTab.setColor('#ffff00')
      this.renderSkins('pipe')
    })

    // --- Кнопка старта ---
    const startButton = this.add
      .text(width / 2, height - 60, 'Start game', {
        fontSize: '36px',
        backgroundColor: '#00000055',
        padding: { x: 25, y: 10 },
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })

    startButton.on('pointerdown', () => {
      this.scene.start('GameScene', {
        skin: this.selectedBirdSkin,
        pipe: this.selectedPipeSkin,
      })
    })
  }

  private renderSkins(type: 'bird' | 'pipe') {
    const { width } = this.scale
    this.scrollArea.removeAll(true)
    this.skinFrames = []

    const skins = type === 'bird' ? birdSkins : pipesSkins
    const columns = width < 600 ? 3 : width < 900 ? 5 : 8
    const spacingX = width / columns
    const spacingY = 120

    skins.forEach((skin, index) => {
      const col = index % columns
      const row = Math.floor(index / columns)
      const x = spacingX * col + spacingX / 2
      const y = spacingY * row + 60

      const sprite = this.add.sprite(x, y, skin.name)
      sprite.setDisplaySize(skin?.width / 3, skin?.height / 3)
      sprite.setInteractive({ useHandCursor: true })

      const frame = this.add
        .rectangle(x, y, skin?.width / 3 + 10, skin?.height / 3 + 10)
        .setStrokeStyle(3, 0xffff00)
        .setVisible(false)

      this.skinFrames.push(frame)

      sprite.on('pointerdown', () => {
        if (type === 'bird') {
          this.selectedBirdSkin = skin.name
        } else {
          this.selectedPipeSkin = skin.name
        }
        this.highlightSelection(frame)
      })

      this.scrollArea.add([frame, sprite])
    })
  }

  private highlightSelection(selectedFrame: Phaser.GameObjects.Rectangle) {
    this.skinFrames.forEach((frame) => frame.setVisible(false))
    selectedFrame.setVisible(true)
  }
}
