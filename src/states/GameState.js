/**
 * Created by khachatur on 6/29/17.
 */
import Phaser from 'phaser'

import AudioManager from '../AudioManager'
export default class GameState extends Phaser.State {
  static STATE_IN_GAME = 0
  static STATE_LEVEL_COMPLETE = 1

  static SOUND_REPEAT_DURATION = 10000;

  init () {
    this.stage.backgroundColor = '#9df6e4'
    this.levelAnimals = this.game.cache.getJSON('gameData').levels
    this.levelBackground = this.game.cache.getJSON('backgroundData').levels

    // this.audioManager = AudioManager.instance

    this.container = this.game.add.group()

    this.createBackground(this.levelBackground[0])
    this.createAnimals(this.levelAnimals[0])

    this.key1 = this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT)
    this.key1.onHoldCallback = this.scrollLeft.bind(this)

    this.key2 = this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT)
    this.key2.onHoldCallback = this.scrollRight.bind(this)

    this.game.input.onTap.add(this.clickListener, this)

    this.game.add.sprite(0, 0, this.bmd)
    console.log(this.bmd)
  }

  clickListener (event) {
    const data = this.game.context.getImageData(event.position.x - 100, event.position.y - 100, 200, 200)

    const cnv = document.createElement('canvas')
    cnv.width = 200
    cnv.height = 200
    cnv.getContext('2d').putImageData(data, 0, 0)
    var image = cnv.toDataURL('image/png').replace('image/png', 'image/octet-stream')  // here is the most important part because if you dont replace you will get a DOM 18 exception.

    window.location.href = image // it will save locally
  }

  scrollLeft () {
    this.container.x += 10
  }

  scrollRight () {
    this.container.x -= 10
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
}
