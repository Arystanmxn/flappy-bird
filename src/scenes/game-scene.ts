import Phaser from 'phaser'

export class GameScene extends Phaser.Scene {
  private bird!: Phaser.GameObjects.Rectangle
  private birdBody!: Phaser.Physics.Arcade.Body
  private pipes!: Phaser.Physics.Arcade.Group
  private timer!: Phaser.Time.TimerEvent
  private scoreText!: Phaser.GameObjects.Text
  private startText!: Phaser.GameObjects.Text
  private scoreZones: Phaser.GameObjects.Zone[] = []
  private difficultyText!: Phaser.GameObjects.Text
  private score = 0
  private gameStarted = false
  private gameEnded = false

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

  create() {
    const { width, height } = this.scale

    // === Bird ===
    this.bird = this.add.rectangle(100, 300, 30, 30, 0xffcc00)
    this.bird.setStrokeStyle(3, 0xff8800)
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
      delay: 1800,
      callback: this.spawnPipes,
      callbackScope: this,
      loop: true,
    })

    // First pipe through 800ms
    this.time.delayedCall(800, this.spawnPipes, [], this)
  }

  spawnPipes() {
    const { width, height } = this.scale
    const gap = this.settings[this.difficulty].gap
    const minY = height * 0.2
    const maxY = height * 0.8
    const gapCenterY = Phaser.Math.Between(minY, maxY)
    const pipeWidth = 60

    // === Top Pipe ===
    const topHeight = gapCenterY - gap / 2
    const topPipe = this.physics.add.image(width + pipeWidth / 2, topHeight / 2, 'pipe')
    topPipe.setDisplaySize(pipeWidth, topHeight)
    topPipe.setImmovable(true)
    topPipe.body.setAllowGravity(false)

    // === Bottom Pipe ===
    const bottomHeight = height - (gapCenterY + gap / 2)
    const bottomY = gapCenterY + gap / 2 + bottomHeight / 2
    const bottomPipe = this.physics.add.image(width + pipeWidth / 2, bottomY, 'pipe')
    bottomPipe.setDisplaySize(pipeWidth, bottomHeight)
    bottomPipe.setImmovable(true)
    bottomPipe.body.setAllowGravity(false)
    this.pipes.add(topPipe)
    this.pipes.add(bottomPipe)

    // === Score Zone ===
    const scoreZone = this.add.zone(width + pipeWidth, gapCenterY, 5, gap)
    this.physics.world.enable(scoreZone)
    const zoneBody = scoreZone.body as Phaser.Physics.Arcade.Body
    zoneBody.setAllowGravity(false)
    zoneBody.setImmovable(true)

    this.scoreZones.push(scoreZone)

    let scored = false
    this.physics.add.overlap(
      this.bird,
      scoreZone,
      () => {
        if (!scored) {
          this.score++
          this.scoreText.setText(this.score.toString())
          scored = true
        }
      },
      undefined,
      this,
    )

    // Remove objects off the screen
    this.time.delayedCall(6000, () => {
      topPipe.destroy()
      bottomPipe.destroy()
      scoreZone.destroy()
    })
  }

  update() {
    const speed = this.settings[this.difficulty].speed
    const delta = this.game.loop.delta / 1000

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

    // --- pipe movement ---
    this.pipes.getChildren().forEach((pipe: any) => {
      const body = pipe.body as Phaser.Physics.Arcade.Body
      if (body) {
        body.x += speed * delta
        pipe.x = body.x + pipe.displayWidth / 2
      }
    })

    // --- zone movement ---
    this.scoreZones.forEach((zone) => {
      const body = zone.body as Phaser.Physics.Arcade.Body
      if (body) {
        body.x += speed * delta
        zone.x = body.x + zone.displayWidth / 2
      }
    })

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

    // Texts
    this.add
      .text(width / 2, height / 2 - 40, 'GAME OVER!', {
        fontSize: `${Math.round(height / 10)}px`,
        color: '#ff0000',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 6,
      })
      .setOrigin(0.5)

    this.add
      .text(width / 2, height / 2 + 20, `Score: ${this.score}`, {
        fontSize: `${Math.round(height / 15)}px`,
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5)

    this.add
      .text(width / 2, height / 2 + 80, 'Press SPACE or CLICK to restart', {
        fontSize: `${Math.round(height / 30)}px`,
        color: '#ffffff',
      })
      .setOrigin(0.5)
  }

  restartGame() {
    this.scene.restart()
    this.gameStarted = false
    this.gameEnded = false
  }
}
