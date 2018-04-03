import Phaser from 'phaser'
import PhaserNineSlice from '../lib/phaser-nineslice'

export default class SettingsPopup extends Phaser.Group {
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

    this.panel = new PhaserNineSlice.NineSlice(
            this.game,           // Phaser.Game
      this.game.width / 2,            // x position
      this.game.height / 2,            // y position
            'ui',      // atlas key
            'popupBg', // Image frame
            400,            // expected width
            400,            // expected height
      { // And this is the framedata, normally this is passed when preloading. Check README for details
        top: 20,    // Amount of pixels for top
        bottom: 20, // Amount of pixels for bottom
        left: 20,   // Amount of pixels for left
        right: 20   // Amount of pixels for right
      }
    )
    this.panel.anchor.set(0.5, 0.5)
    this.panel.resize(400, 400)
    this.add(this.panel)

    this.submitButton = this.game.add.sprite(this.game.width / 2, this.game.height / 2 + 200, 'ui', 'submit', this)
    this.submitButton.inputEnabled = true
    this.submitButton.anchor.set(0.5, 0.5)
    this.submitButton.events.onInputDown.add(this.onSubmit, this)

    this.submitLabel = this.game.add.text(0, 0, 'PLAY', {font: '50px Luckiest Guy', fill: '#ffffff'}, this)
    this.submitLabel.anchor.set(0.5, 0.5)
    this.submitLabel.setShadow(-2, 2, 'rgba(0,0,0,0.5)', 4)
    this.submitButton.addChild(this.submitLabel)

    this.voiceLabel = this.game.add.text(this.game.width / 2 - 180, this.game.height / 2 - 100, ' VOICE', {font: '65px Luckiest Guy', fill: '#ffc600'}, this)
    this.voiceLabel.anchor.set(0, 0.5)
    this.voiceLabel.setShadow(-2, 2, 'rgba(0,0,0,0.5)', 4)

    this.namesLabel = this.game.add.text(this.game.width / 2 - 180, this.game.height / 2, ' NAMES', {font: '65px Luckiest Guy', fill: '#ffc600'}, this)
    this.namesLabel.anchor.set(0, 0.5)
    this.namesLabel.setShadow(-2, 2, 'rgba(0,0,0,0.5)', 4)

    this.voiceButton = this.game.add.sprite(this.game.width / 2 + 130, this.game.height / 2 - 100, 'ui', 'checkBox', this)
    this.voiceButton.inputEnabled = true
    this.voiceButton.anchor.set(0.5, 0.5)
    this.voiceButton.scale.set(1.5)
    this.voiceButton.events.onInputDown.add(this.onVoiceSubmit, this)

    this.voiceCheckMark = this.game.add.image(0, 0, 'ui', 'checkMark')
    this.voiceCheckMark.anchor.set(0.5, 0.5)
    this.voiceCheckMark.visible = this.settings.enableVoice
    this.voiceButton.addChild(this.voiceCheckMark)

    this.namesButton = this.game.add.sprite(this.game.width / 2 + 130, this.game.height / 2, 'ui', 'checkBox', this)
    this.namesButton.inputEnabled = true
    this.namesButton.anchor.set(0.5, 0.5)
    this.namesButton.scale.set(1.5)
    this.namesButton.events.onInputDown.add(this.onNamesSubmit, this)

    this.namesCheckMark = this.game.add.image(0, 0, 'ui', 'checkMark')
    this.namesCheckMark.anchor.set(0.5, 0.5)
    this.namesCheckMark.visible = this.settings.enableLabel
    this.namesButton.addChild(this.namesCheckMark)

    if (this.game.lang === 'zh') {
      this.pinyinLabel = this.game.add.text(this.game.width / 2 - 180, this.game.height / 2 + 100, ' PINYIN', {font: '65px Luckiest Guy', fill: '#ffc600'}, this)
      this.pinyinLabel.anchor.set(0, 0.5)
      this.pinyinLabel.setShadow(-2, 2, 'rgba(0,0,0,0.5)', 4)

      this.pinyinButton = this.game.add.sprite(this.game.width / 2 + 130, this.game.height / 2 + 100, 'ui', 'checkBox', this)
      this.pinyinButton.inputEnabled = true
      this.pinyinButton.anchor.set(0.5, 0.5)
      this.pinyinButton.scale.set(1.5)
      this.pinyinButton.events.onInputDown.add(this.onPinyinSubmit, this)

      this.pinyinCheckMark = this.game.add.image(0, 0, 'ui', 'checkMark')
      this.pinyinCheckMark.anchor.set(0.5, 0.5)
      this.pinyinCheckMark.visible = this.settings.enablePinyin
      this.pinyinButton.addChild(this.pinyinCheckMark)
    } else {
      this.submitButton.y = this.game.height / 2 + 100
    }
  }

  onVoiceSubmit () {
    this.voiceCheckMark.visible = this.settings.enableVoice = !this.voiceCheckMark.visible

    if (!this.settings.enableVoice) {
      this.namesCheckMark.visible = this.settings.enableLabel = true
    }
  }

  onNamesSubmit () {
    if (!this.settings.enableVoice) {
      return
    }
    this.namesCheckMark.visible = this.settings.enableLabel = !this.namesCheckMark.visible
  }

  onPinyinSubmit () {
    this.pinyinCheckMark.visible = this.settings.enablePinyin = !this.pinyinCheckMark.visible
  }

  onSubmit () {
    this.submitAction.dispatch(this.settings)
    this.visible = false
  }
}
