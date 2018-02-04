import Phaser from 'phaser'

export default class SettingsPopup extends Phaser.Group {
  constructor (game) {
    super(game)
    this.submitAction = new Phaser.Signal()
    this.settings = {
      enableVoice: true,
      enableLabel: false,
      pinyin: false
    }
    this.createUI()
  }

  createUI () {
    this.background = this.game.add.image(this.game.width / 2, this.game.height / 2, 'ui', 'settingsBg', this)
    this.background.anchor.set(0.5, 0.5)

    this.submitButton = this.game.add.image(this.game.width / 2, this.game.height / 2, 'ui', 'nextButton', this)
    this.submitButton.inputEnabled = true
    this.submitButton.events.onInputDown.add(this.onSubmit, this)
  }

  onSubmit () {
    this.submitAction.dispatch(this.settings)
    this.visible = false
  }
}
