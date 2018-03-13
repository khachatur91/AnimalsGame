import Phaser from 'phaser'
import { timeToMMSS } from './utils'

export default class AnimalName extends Phaser.Group {
  constructor (game) {
    super(game)
    this.init()
  }

  init () {
    this.nameFrame = this.game.add.image(this.game.width / 2, this.game.height + 30, 'ui', 'nameFrame', this)
    this.nameFrame.anchor.x = 0.5
    this.nameFrame.anchor.y = 1

    this.nameLabel = this.game.add.text(0, -35, '', {font: 'Luckiest Guy'}, this)
    this.nameLabel.anchor.x = 0.5
    this.nameLabel.anchor.y = 1
    this.nameLabel.fontSize = 50
    this.nameLabel.fill = '#ffffff'
    this.nameFrame.addChild(this.nameLabel)

    if (this.game.lang === 'zh') {
      this.pinyuinLabel = this.game.add.text(0, -5, '', {font: 'Luckiest Guy'}, this)
      this.pinyuinLabel.anchor.x = 0.5
      this.pinyuinLabel.anchor.y = 1
      this.pinyuinLabel.fontSize = 30
      this.pinyuinLabel.fill = '#ffffff'
      this.nameFrame.addChild(this.pinyuinLabel)
    }
  }

  setPinyuin (flag) {
    this.pinyuinLabel.visible = flag
  }

  updateText (name, pinyuin) {
    this.nameLabel.text = name
    if (this.game.lang === 'zh') {
      this.pinyuinLabel.text = pinyuin
    }
  }
}
