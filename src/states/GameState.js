/**
 * Created by khachatur on 6/29/17.
 */
import Phaser from 'phaser'

import AudioManager from '../AudioManager'
export default class GameState extends Phaser.State {
  static STATE_IN_GAME = 0
  static STATE_LEVEL_COMPLETE = 1

  static SOUND_REPEAT_DURATION = 10000;
  static SCROLL_SPEED = 10;

  init () {
    this.stage.backgroundColor = '#9df6e4'
    this.levelAnimals = this.game.cache.getJSON('gameData').levels
    this.levelBackground = this.game.cache.getJSON('backgroundData').levels

    this.audioManager = AudioManager.instance

    this.container = this.game.add.group()
    this.container.inputEnableChildren = true

    this.createBackground(this.levelBackground[0])
    this.createAnimals(this.levelAnimals[0])

    this.createPhotoFrame()

    this.container.onChildInputUp.add(this.clickListener, this)

    this.createUI()

    this.key1 = this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT)
    this.key1.onHoldCallback = this.scrollLeft.bind(this)

    this.key2 = this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT)
    this.key2.onHoldCallback = this.scrollRight.bind(this)

    this.game.add.sprite(0, 0, this.bmd)
    console.log(this.bmd)
  }

  clickListener () {
    AudioManager.instance.play('photoSFX')
    this.photoFrame.visible = true
    const pos = this.game.input.activePointer.position
    this.photoFrame.position.set(pos.x, pos.y)
    this.photoFrame.scale.set(0.3, 0.3)

    const tween = this.game.add.tween(this.photoFrame.scale)
    tween.to({x: 1,
      y: 1
    },
      100)
    tween.onComplete.add(() => {
      this.photoFrame.visible = false
    })
    tween.start()

    const data = this.game.context.getImageData(pos.x - 256, pos.y - 128, 512, 256)

    const cnv = document.createElement('canvas')
    cnv.width = 512
    cnv.height = 256
    cnv.getContext('2d').putImageData(data, 0, 0)
    var image = cnv.toDataURL('image/png').replace('image/png', 'image/octet-stream')  // here is the most important part because if you dont replace you will get a DOM 18 exception.

    window.location.href = image // it will save locally
  }

  scrollLeft () {
    if (this.container.x < -GameState.SCROLL_SPEED) {
      this.container.x += 10
    } else {
      this.container.x = 0
    }
  }

  scrollLeftStep () {
    AudioManager.instance.play('revealSFX')

    const tween = this.game.add.tween(this.container)
    tween.to({x: -(this.container.width - this.game.canvas.width)}, 500)
    tween.start()
    this.leftButton.visible = false
    this.rightButton.visible = true
  }

  scrollRightStep () {
    AudioManager.instance.play('revealSFX')

    const tween = this.game.add.tween(this.container)
    tween.to({x: 0}, 500)
    tween.start()
    this.rightButton.visible = false
    this.leftButton.visible = true
  }

  scrollRight () {
    if (this.container.x > -(this.container.width - this.game.canvas.width - GameState.SCROLL_SPEED)) {
      this.container.x -= 10
    } else {
      this.container.x = -(this.container.width - this.game.canvas.width)
    }
  }

  createUI () {
    this.leftButton = this.game.add.button(this.game.width - 100, this.game.height / 2, 'ui', this.scrollLeftStep, this, 'nextButton', 'nextButton', 'nextButton', 'nextButton')
    this.leftButton.anchor.set(1, 0.5)

    this.rightButton = this.game.add.button(100, this.game.height / 2, 'ui', this.scrollRightStep, this, 'nextButton', 'nextButton', 'nextButton', 'nextButton')
    this.rightButton.anchor.set(1, 0.5)
    this.rightButton.scale.x = -1
    this.rightButton.visible = false
  }

  createAnimals (animals) {
    animals.forEach((animal) => {
      const image = this.game.add.image(animal.x, animal.y, 'safari', animal.key, this.container)
      image.scale = new Phaser.Point(animal.scale, Math.abs(animal.scale))
    })
  }

  createBackground (items) {
    this.game.add.tileSprite(0, 100, 3000, 429, 'safari', 'mountains', this.container)
    this.game.add.tileSprite(0, 350, 3000, 158, 'safari', 'bgGreen', this.container)
    this.game.add.tileSprite(0, 500, 3000, 274, 'safari', 'ground1', this.container)
    this.game.add.tileSprite(0, 650, 3000, 500, 'safari', 'ground2', this.container)

    items.forEach((item) => {
      const image = this.game.add.image(item.x, item.y, 'safari', item.key, this.container)
      image.scale = new Phaser.Point(item.scale, Math.abs(item.scale))
    })
  }

  createPhotoFrame () {
    this.photoFrame = this.game.add.image(0, 0, 'ui', 'fotoFrame')
    this.photoFrame.visible = false
    this.photoFrame.anchor.set(0.5, 0.5)
  }
}
