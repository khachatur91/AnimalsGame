import Phaser from 'phaser'

export default class GameView extends Phaser.Group {
  static SCROLL_DURATION = 2000;

  constructor (game, animalsData, backgroundData) {
    super(game)
    this.levelAnimals = animalsData
    this.levelBackground = backgroundData
    this.init()
  }

  init () {
    this.signalAnimalClick = new Phaser.Signal()
    this.container1 = this.game.add.group()
    this.container2 = this.game.add.group()
    this.container3 = this.game.add.group()

    this.animalsList = this.levelAnimals[0]

    this.currentAnimalIndex = 0
    this.createBackground(this.levelBackground[0])

    this.createAnimals(this.levelAnimals[0])
  }

  scrollRightStep () {
    let tween = this.game.add.tween(this.container3)
    tween.to({x: -(4000 - this.game.canvas.width)}, GameView.SCROLL_DURATION)
    tween.start()

    tween = this.game.add.tween(this.container2)
    tween.to({x: -(3700 - this.game.canvas.width)}, GameView.SCROLL_DURATION)
    tween.start()

    tween = this.game.add.tween(this.container1)
    tween.to({x: -(3600 - this.game.canvas.width)}, GameView.SCROLL_DURATION)
    tween.start()
  }

  scrollLeftStep () {
    let tween = this.game.add.tween(this.container3)
    tween.to({x: 0}, GameView.SCROLL_DURATION)
    tween.start()

    tween = this.game.add.tween(this.container2)
    tween.to({x: 0}, GameView.SCROLL_DURATION)
    tween.start()
    tween = this.game.add.tween(this.container1)
    tween.to({x: 0}, GameView.SCROLL_DURATION)
    tween.start()

  }

  createAnimals (animals) {
    animals.forEach((animal) => {
      const image = this.game.add.image(animal.x, animal.y, 'animals', animal.key)
      image.inputEnabled = true

      image.events.onInputDown.add(this.onAnimalClick, this)

      image.scale = new Phaser.Point(animal.scale, Math.abs(animal.scale))
      image.anchor.set(0.5, 1)
      if (image.y > 806) {
        this.container3.addChild(image)
      } else {
        this.container2.addChild(image)
      }
    })
  }

  onAnimalClick (data) {
    this.signalAnimalClick.dispatch(data)
  }

  createBackground (items) {
    this.game.add.tileSprite(0, 0, 4000, 668, 'background', 'sky', this.container1)
    this.game.add.tileSprite(0, 383, 4000, 429, 'background', 'mountains', this.container1)
    this.game.add.tileSprite(-300, 580, 4300, 158, 'background', 'bgGreen', this.container1)
    this.game.add.tileSprite(0, 600, 4000, 158, 'background', 'bgGreen1', this.container2)
    this.game.add.tileSprite(0, 695, 4000, 274, 'background', 'ground2', this.container2)

    if (this.game.type === 'farm') {
      this.game.add.image(0, 710, 'background', 'fgGreen', this.container3)
    }
    this.game.add.tileSprite(0, 806, 4000, 274, 'background', 'ground1', this.container3)

    if (this.game.type === 'safari') {
      this.game.add.image(0, 866, 'background', 'groundColor1', this.container3)
      this.game.add.image(1186, 842, 'background', 'groundColor2', this.container3)
    }

    items.forEach((item) => {
      let image = this.game.add.image(item.x, item.y, 'background', item.key)
      if (item.key.substr(0, 4) === 'tree') {
        const shadow = this.game.add.image(item.x, item.y, 'background', 'shadow')
        image.position.set(0, 0)
        image.anchor.set(0.5, 1)
        image.scale.x = item.scale > 0 ? 1 : -1
        shadow.addChild(image)
        image = shadow
        image.scale = new Phaser.Point(Math.abs(item.scale), Math.abs(item.scale))
      } else {
        image.scale = new Phaser.Point(item.scale, Math.abs(item.scale))
      }
      if (item.y > 806) {
        this.container3.addChild(image)
      } else {
        this.container2.addChild(image)
      }
      image.anchor.set(0.5, 1)
    })
  }
}
