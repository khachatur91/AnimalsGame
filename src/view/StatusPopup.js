import Phaser from 'phaser'

export default class StatusPopup extends Phaser.Group {
  constructor (game) {
    super(game)
    this.submitAction = new Phaser.Signal()
    this.settings = {
      enableVoice: true,
      enableLabel: true,
      enablePinyin: false
    }
    this.createUI()
  }

  createUI () {
    const graph = this.game.make.graphics()
    graph.beginFill(0, 0.5)
    graph.drawRect(0, 0, this.game.width, this.game.height)
    graph.endFill()

    this.background = this.game.add.image(0, 0, graph.generateTexture(), '', this)
    this.background.inputEnabled = true

    this.label = this.game.add.text(this.game.width / 2, this.game.height / 3, '', {font: 'Luckiest Guy'}, this)
    this.label.anchor.set(0.5, 0.5)
    this.label.fill = '#ffc600'
    this.label.setShadow(-2, 2, 'rgba(0,0,0,0.5)', 4)
    this.label.fontSize = 100
  }

  updateText (text) {
    this.label.text = text
  }
}
