import Phaser from 'phaser'

export default class RestartPopup extends Phaser.Group {
  constructor (game) {
    super(game)
    this.submitAction = new Phaser.Signal()
    this.settings = {
      enableVoice: true,
      enableLabel: true,
      pinyin: false
    }
    this.createUI()
  }

  createUI () {
    this.label = this.game.add.text(this.game.width / 2, this.game.height / 3, '', null, this)
    this.label.anchor.set(0.5, 0.5)
    this.label.fill = 'white'
    this.label.fontSize = 100

    this.submitButton = this.game.add.image(this.game.width / 2, this.game.height / 2, 'ui', 'nextButton', this)
    this.submitButton.inputEnabled = true
    this.submitButton.anchor.x = 0.5
    this.submitButton.events.onInputDown.add(this.onSubmit, this)
  }

  setAnimalsAmount (number) {
    this.label.text = `Yeah! You found ${number} animals.`
  }

  onSubmit () {
    this.submitAction.dispatch(this.settings)
    this.visible = false
  }
}
