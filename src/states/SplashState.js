import Phaser from 'phaser'
import Game from '../main'

export default class SplayState extends Phaser.State {
  init () {
    this.stage.backgroundColor = '#d89d43'
    this.isLoaded = false
    this.isTweenComplete = false
  }
  preload () {
    this.logo = this.game.add.image(this.game.world.centerX, this.game.world.centerY, 'logo')
    this.logo.alpha = 0
    this.logo.anchor.setTo(0.5)
    let tween = this.game.add.tween(this.logo)
    tween.to({alpha: 1}, 500, Phaser.Easing.Quadratic.Out, false, 100).to({alpha: 0}, 500, Phaser.Easing.Quadratic.Out, true)
    tween.onComplete.add(this.onTweenComplete, this)

    const audioData = this.game.cache.getJSON('audioData')

    audioData.sounds.forEach((sound) => {
      sound.urls[0] = sound.urls[0].replace('%{lang}', this.game.lang)
      sound.urls[0] = sound.urls[0].replace('%{ext}', this.game.lang === 'en' ? 'm4a' : 'mp3')
    })
    console.log(audioData)
    this.game.load.pack('initial', `assets/assets-${this.game.theme}.json`)
    this.game.load.pack('sounds', null, audioData)
    this.game.load.json('locale', `assets/${this.game.theme}/locale/${this.game.lang}/animals.json`)
    this.game.load.start()
  }

  create () {
    this.isLoaded = true
    if (this.isTweenComplete) {
      if (this.game.user) {
        this.state.start(Game.STATE_GAME_STUDENT)
      } else {
        this.state.start(Game.STATE_GAME)
      }
    }
  }

  onTweenComplete () {
    this.isTweenComplete = true
    if (this.isLoaded) {
      if (this.game.user) {
        this.state.start(Game.STATE_GAME_STUDENT)
      } else {
        this.state.start(Game.STATE_GAME)
      }
    }
  }
}
