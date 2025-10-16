import Phaser from 'phaser'
import { birdSkins, type TBirdSkin } from '../consts/bird-skins.consts'
import { pipesSkins, type TPipesSkin } from '../consts/pipes-skins.consts'

export class GameScene extends Phaser.Scene {
  private bird!: Phaser.GameObjects.Sprite
  private birdBody!: Phaser.Physics.Arcade.Body
  private birdSkin!: TBirdSkin
  private pipes!: Phaser.Physics.Arcade.Group
  private timer!: Phaser.Time.TimerEvent
  private scoreText!: Phaser.GameObjects.Text
  private startText!: Phaser.GameObjects.Text
  private scoreZones: Phaser.GameObjects.Zone[] = []
  private difficultyText!: Phaser.GameObjects.Text
  private pipeSkin!: TPipesSkin
  private selectedPipeSkin = 'soap'
  private score = 0
  private gameStarted = false
  private gameEnded = false
  private selectedSkin = 'uzbekistan'

  // === Settings ===
  private difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  private settings = {
    easy: { gap: 250, speed: -160 },
    medium: { gap: 200, speed: -190 },
    hard: { gap: 150, speed: -240 },
  }

  private uiClicked = false

  constructor() {
    super('GameScene')
  }

  init(data: { skin?: string; pipe?: string }) {
    if (data.skin) {
      this.selectedSkin = data.skin
      this.birdSkin = birdSkins.find((skin) => skin.name === this.selectedSkin)! as TBirdSkin
    }
    if (data.pipe) {
      this.selectedPipeSkin = data.pipe
      this.pipeSkin = pipesSkins.find((skin) => skin.name === this.selectedPipeSkin)! as TPipesSkin
    }
  }

  preload() {
    birdSkins.forEach((skin: { name: string; image: string }) => {
      this.load.image(skin.name, skin.image)
    })

    pipesSkins.forEach((skin: { name: string; image: string }) => {
      this.load.image(skin.name, skin.image)
    })
  }

  create() {
    const { width, height } = this.scale

    // === Bird ===
    // this.bird = this.add.rectangle(100, 300, 30, 30, 0xffcc00)
    this.bird = this.add.sprite(100, 300, this.birdSkin.name)
    this.bird.setDisplaySize(this.birdSkin.displayWidth * 2, this.birdSkin.displayHeight * 2)
    // this.bird.setStrokeStyle(3, 0xff8800)
    this.physics.add.existing(this.bird)
    this.birdBody = this.bird.body as Phaser.Physics.Arcade.Body
    this.birdBody.setCollideWorldBounds(false)
    this.birdBody.setAllowGravity(true)
    this.birdBody.setGravityY(0)

    // === Start Text ===
    this.startText = this.add.text(width / 2, height / 2, 'Press SPACE or CLICK to start', {
      fontSize: `${Math.round(height / 25)}px`,
      color: '#ffffff',
      fontStyle: 'bold',
    })
    this.startText.setOrigin(0.5)

    // === Control ===
    this.input.on('pointerdown', () => this.flap())
    this.input.keyboard?.on('keydown-SPACE', this.flap, this)

    // === Pipes ===
    this.pipes = this.physics.add.group()

    // === Score ===
    this.score = 0
    this.scoreText = this.add.text(20, 20, '0', {
      fontSize: '36px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    })
    this.scoreText.setDepth(1000)

    // === Difficulty Selector ===
    this.difficultyText = this.add
      .text(width - 20, 20, 'Difficulty: Medium', {
        fontSize: '24px',
        color: '#ffffff',
        backgroundColor: '#00000055',
        padding: { x: 10, y: 5 },
      })
      .setOrigin(1, 0)
      .setDepth(1000)
      .setInteractive({ useHandCursor: true })

    this.difficultyText.on('pointerdown', () => this.changeDifficulty())
  }

  changeDifficulty() {
    const difficulties = ['easy', 'medium', 'hard']

    // 🔒 Set flag that this was a click on UI
    this.uiClicked = true
    this.time.delayedCall(100, () => (this.uiClicked = false))

    if (this.gameStarted) return
    const currentIndex = difficulties.indexOf(this.difficulty)
    const next = (currentIndex + 1) % difficulties.length
    this.difficulty = difficulties[next] as 'easy' | 'medium' | 'hard'
    const diffLabel = this.difficulty[0].toUpperCase() + this.difficulty.slice(1)
    let color = '#ffffff'
    if (this.difficulty === 'easy') color = '#00ff00'
    if (this.difficulty === 'medium') color = '#ffff00'
    if (this.difficulty === 'hard') color = '#ff0000'
    this.difficultyText.setColor(color)
    this.difficultyText.setText(`Difficulty: ${diffLabel}`)
  }

  flap() {
    if (this.uiClicked) return

    if (!this.gameStarted) {
      this.startGame()
    }

    if (this.gameStarted && !this.gameEnded) {
      this.birdBody.setVelocityY(-350)
    }
  }

  startGame() {
    this.gameStarted = true
    this.startText.setVisible(false)
    this.birdBody.setGravityY(800)

    // Start pipe spawn
    this.timer = this.time.addEvent({
      delay: 2800,
      callback: this.spawnPipes,
      callbackScope: this,
      loop: true,
    })

    // First pipe through 800ms
    this.time.delayedCall(800, this.spawnPipes, [], this)
  }

  spawnPipes() {
    const speed = this.settings[this.difficulty].speed

    const { width, height } = this.scale
    const gap = this.settings[this.difficulty].gap
    const minY = height * 0.2
    const maxY = height * 0.8
    const gapCenterY = Phaser.Math.Between(minY, maxY)
    const pipeWidth = this.pipeSkin.width
    const pipeTexture = this.pipeSkin.name

    const topHeight = gapCenterY - gap / 2
    const bottomHeight = height - (gapCenterY + gap / 2)
    const bottomY = gapCenterY + gap / 2 + bottomHeight / 2

    // === Верхняя труба (перевернутая) ===
    const topPipe = this.add.tileSprite(
      width + pipeWidth / 2,
      topHeight / 2,
      pipeWidth,
      topHeight,
      pipeTexture,
    )
    topPipe.setOrigin(0.5)
    topPipe.setFlipY(true)
    topPipe.setFlipX(true)
    this.physics.add.existing(topPipe)
    const topBody = topPipe.body as Phaser.Physics.Arcade.Body
    topBody.setImmovable(true)
    topBody.setAllowGravity(false)

    // === Нижняя труба ===
    const bottomPipe = this.add.tileSprite(
      width + pipeWidth / 2,
      bottomY,
      pipeWidth,
      bottomHeight,
      pipeTexture,
    )
    bottomPipe.setOrigin(0.5)
    this.physics.add.existing(bottomPipe)
    const bottomBody = bottomPipe.body as Phaser.Physics.Arcade.Body
    bottomBody.setImmovable(true)
    bottomBody.setAllowGravity(false)

    // === Добавляем трубы в группу ===
    this.pipes.addMultiple([topPipe, bottomPipe])

    // === Двигаем трубы влево ===
    topBody.setVelocityX(speed)
    bottomBody.setVelocityX(speed)

    // === Зона для очков (движется вместе с трубами) ===
    const scoreZone = this.add.zone(width + pipeWidth, gapCenterY, 5, gap)
    this.physics.world.enable(scoreZone)
    const zoneBody = scoreZone.body as Phaser.Physics.Arcade.Body
    zoneBody.setAllowGravity(false)
    zoneBody.setImmovable(true)
    zoneBody.setVelocityX(speed)

    this.scoreZones.push(scoreZone)

    // === Счётчик ===
    let scored = false
    this.physics.add.overlap(
      this.bird,
      scoreZone,
      () => {
        if (!scored) {
          scored = true
          this.score++
          this.scoreText.setText(this.score.toString())
        }
      },
      undefined,
      this,
    )

    // === Удаляем объекты за экраном ===
    this.time.delayedCall(8000, () => {
      topPipe.destroy()
      bottomPipe.destroy()
      scoreZone.destroy()
    })
  }

  update() {
    const { height } = this.scale

    if (this.gameEnded) {
      const isDown =
        this.input.activePointer.isDown ||
        this.input.keyboard?.checkDown(
          this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
          250,
        )

      if (isDown) {
        this.restartGame()
      }
      return
    }

    // --- Do nothing before start ---
    if (!this.gameStarted) return

    // --- Main logic ---
    this.physics.overlap(this.bird, this.pipes, this.gameOver, undefined, this)

    if (this.bird.y > height || this.bird.y < 0) {
      this.gameOver()
    }

    const angle = Phaser.Math.Clamp(this.birdBody.velocity.y * 0.1, -30, 90)
    this.bird.angle = angle

    this.scoreZones = this.scoreZones.filter((zone) => {
      if (zone.x + zone.width < 0) {
        zone.destroy()
        return false
      }
      return true
    })
  }

  gameOver() {
    if (this.gameEnded) return
    this.gameEnded = true

    if (this.timer) {
      this.timer.remove()
    }

    this.pipes.setVelocityX(0)
    const { width, height } = this.scale

    // --- GAME OVER ---
    this.add
      .text(width / 2, height / 2 - 40, 'GAME OVER!', {
        fontSize: `${Math.round(height / 10)}px`,
        color: '#ff0000',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setDepth(1000)

    this.add
      .text(width / 2, height / 2 + 20, `Score: ${this.score}`, {
        fontSize: `${Math.round(height / 15)}px`,
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(1000)

    this.add
      .text(width / 2, height / 2 + 80, 'Press SPACE or CLICK to restart', {
        fontSize: `${Math.round(height / 30)}px`,
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setDepth(1000)

    // --- BACK TO LOBBY BUTTON ---
    const backButton = this.add
      .text(width / 2, height / 2 + 140, '← Back to Lobby', {
        fontSize: `${Math.round(height / 30)}px`,
        backgroundColor: '#00000055',
        padding: { x: 20, y: 10 },
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setDepth(1000)

    backButton.on('pointerdown', () => {
      this.scene.start('LobbyScene')
    })
  }

  restartGame() {
    this.scene.restart()
    this.gameStarted = false
    this.gameEnded = false
  }
}
