/**
 * Created by khachatur on 6/29/17.
 */
import Phaser from 'phaser'

import AudioManager from '../AudioManager'
export default class GameState extends Phaser.State {
  static STATE_IN_GAME = 0
  static STATE_LEVEL_COMPLETE = 1
  static STATE_PHOTO = 2

  static SOUND_REPEAT_DURATION = 10000;
  static SCROLL_SPEED = 10;
  static SCROLL_DURATION = 2000;

  init () {
    this.currentPage = 0
    this.stage.backgroundColor = '#9df6e4'
    this.levelAnimals = this.game.cache.getJSON('gameData').levels
    this.levelBackground = this.game.cache.getJSON('backgroundData').levels

    this.audioManager = AudioManager.instance

    this.container1 = this.game.add.group()
    this.container2 = this.game.add.group()
    this.container3 = this.game.add.group()

    this.createBackground(this.levelBackground[0])
    this.createAnimals(this.levelAnimals[0])

    this.createPhotoFrame()

    this.createUI()

    this.gameState = GameState.STATE_IN_GAME
    this.game.add.sprite(0, 0, this.bmd)
    console.log(this.bmd)
  }

  clickListener () {
    if (this.gameState !== GameState.STATE_IN_GAME) {
      return
    }
    this.gameState = GameState.STATE_PHOTO
    AudioManager.instance.play('photoSFX')
    const pos = this.game.input.activePointer.position

    const tweenPalaroid = this.game.add.tween(this.palaroidFrame)
    tweenPalaroid.to({rotation: (Math.random() - 0.5) * Math.PI / 6 + Math.PI * 6, x: this.game.width / 2, y: this.game.height / 2}, 700, Phaser.Easing.Quadratic.In, true, 300)
    tweenPalaroid.onStart.add(() => {
      this.palaroidFrame.visible = true
      this.palaroidFrame.scale.set(0.2, 0.2)
      const tween = this.game.add.tween(this.palaroidFrame.scale)
      tween.to({x: 1, y: 1}, 700)
      tween.start()
    })
    tweenPalaroid.start()

    tweenPalaroid.onComplete.add(() => {
      setTimeout(() => {
        this.palaroidFrame.visible = false
        this.palaroidFrame.rotation = 0
        this.palaroidFrame.position.set(0, 0)
        this.photoFrame.visible = true
        if (this.currentPage === 0) {
          this.rightButton.visible = true
        } else {
          this.leftButton.visible = true
        }
        this.gameState = GameState.STATE_IN_GAME
      }, 1000)
    })

    this.photoFrame.visible = false
    this.rightButton.visible = false
    this.leftButton.visible = false

    setTimeout(() => {
      let x = Math.min(Math.max(0, pos.x - 256), this.game.width - 512)
      let y = Math.min(Math.max(0, pos.y - 256), this.game.height - 512)

      const data = this.game.context.getImageData(x, y, 512, 512)

      this.palaroidBitmapData.ctx.putImageData(data, 0, 0)

      this.palaroidFrame.removeChildren()

      const pic = this.game.add.image(0, -50, this.palaroidBitmapData.texture)
      pic.anchor.set(0.5, 0.5)
      this.palaroidFrame.addChild(pic)

      const flashTween = this.game.add.tween(this.flash)
      flashTween.to({alpha: 1}, 100)
        .to({alpha: 0}, 100)
      flashTween.start()
    }, 50)

    // const cnv = document.createElement('canvas')
    // cnv.width = 512
    // cnv.height = 256
    // cnv.getContext('2d').putImageData(data, 0, 0)
    // var image = cnv.toDataURL('image/png').replace('image/png', 'image/octet-stream')  // here is the most important part because if you dont replace you will get a DOM 18 exception.

    // window.location.href = image // it will save locally
  }

  scrollLeft () {
    if (this.container.x < -GameState.SCROLL_SPEED) {
      this.container.x += 10
    } else {
      this.container.x = 0
    }
  }

  scrollRightStep () {
    this.currentPage = 1

    AudioManager.instance.play('revealSFX')

    let tween = this.game.add.tween(this.container3)
    tween.to({x: -(4000 - this.game.canvas.width)}, GameState.SCROLL_DURATION)
    tween.start()

    tween = this.game.add.tween(this.container2)
    tween.to({x: -(3700 - this.game.canvas.width)}, GameState.SCROLL_DURATION)
    tween.start()

    tween = this.game.add.tween(this.container1)
    tween.to({x: -(3600 - this.game.canvas.width)}, GameState.SCROLL_DURATION)
    tween.start()

    this.rightButton.visible = false
    this.leftButton.visible = true
  }

  scrollLeftStep () {
    this.currentPage = 0

    AudioManager.instance.play('revealSFX')

    let tween = this.game.add.tween(this.container3)
    tween.to({x: 0}, GameState.SCROLL_DURATION)
    tween.start()

    tween = this.game.add.tween(this.container2)
    tween.to({x: 0}, GameState.SCROLL_DURATION)
    tween.start()
    tween = this.game.add.tween(this.container1)
    tween.to({x: 0}, GameState.SCROLL_DURATION)
    tween.start()

    this.leftButton.visible = false
    this.rightButton.visible = true
  }

  scrollRight () {
    if (this.container.x > -(this.container.width - 300 - this.game.canvas.width - GameState.SCROLL_SPEED)) {
      this.container.x -= 10
    } else {
      this.container.x = -(this.container.width - this.game.canvas.width)
    }
  }

  createUI () {
    this.photoFrame = this.game.add.image(0, 0, 'ui', 'fotoFrame')
    this.photoFrame.inputEnabled = true
    this.photoFrame.events.onInputUp.add(this.clickListener, this)
    this.photoFrame.width = this.game.canvas.width - 30
    this.photoFrame.height = this.game.canvas.height - 30
    this.photoFrame.alpha = 0.6
    this.photoFrame.x = 15
    this.photoFrame.y = 15

    this.rightButton = this.game.add.button(this.game.width - 100, this.game.height / 2, 'ui', this.scrollRightStep, this, 'nextButton', 'nextButton', 'nextButton', 'nextButton')
    this.rightButton.anchor.set(1, 0.5)

    this.leftButton = this.game.add.button(100, this.game.height / 2, 'ui', this.scrollLeftStep, this, 'nextButton', 'nextButton', 'nextButton', 'nextButton')
    this.leftButton.anchor.set(1, 0.5)
    this.leftButton.scale.x = -1
    this.leftButton.visible = false

    const grph = this.game.make.graphics(0, 0)
    grph.beginFill(0xffffff, 1)
    grph.drawRect(0, 0, this.game.width, this.game.height)
    grph.endFill()

    this.flash = this.game.add.image(0, 0, grph.generateTexture())
    this.flash.alpha = 0
  }

  createAnimals (animals) {
    animals.forEach((animal) => {
      const image = this.game.add.image(animal.x, animal.y, 'animals', animal.key)
      image.scale = new Phaser.Point(animal.scale, Math.abs(animal.scale))
      image.anchor.set(0.5, 1)
      if (image.y > 806) {
        this.container3.addChild(image)
      } else {
        this.container2.addChild(image)
      }
    })
  }

  createBackground (items) {
    this.game.add.tileSprite(0, 383, 4000, 429, 'background', 'mountains', this.container1)
    this.game.add.tileSprite(300, 580, 4300, 158, 'background', 'bgGreen', this.container1)
    this.game.add.tileSprite(0, 600, 4000, 158, 'background', 'bgGreen1', this.container2)
    this.game.add.tileSprite(0, 695, 4000, 274, 'background', 'ground2', this.container2)
    this.game.add.tileSprite(0, 806, 4000, 274, 'background', 'ground1', this.container3)

    this.game.add.image(0, 866, 'background', 'groundColor1', this.container3)
    this.game.add.image(1186, 842, 'background', 'groundColor2', this.container3)

    items.forEach((item) => {
      const image = this.game.add.image(item.x, item.y, 'background', item.key)
      if (item.y > 806) {
        this.container3.addChild(image)
      } else {
        this.container2.addChild(image)
      }
      image.scale = new Phaser.Point(item.scale, Math.abs(item.scale))
      image.anchor.set(0.5, 1)
    })
  }

  createPhotoFrame () {
    this.palaroidBitmapData = this.game.make.bitmapData(512, 512)
    this.palaroidFrame = this.game.add.sprite(0, 0, 'ui', 'palaroidFrame')
    this.palaroidFrame.visible = false
    this.palaroidFrame.anchor.set(0.5, 0.5)
    this.palaroidFrame.rotation = Math.PI / 10
  }
}
