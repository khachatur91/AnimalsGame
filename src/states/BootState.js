import Phaser from 'phaser'
import Game from '../main'

export default class BootState extends Phaser.State {
  init () {
    this.stage.backgroundColor = '#1b1a23'
    this.game.renderer.renderSession.roundPixels = true

    this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL
    this.game.scale.pageAlignHorizontally = true
    this.game.scale.pageAlignVertically = true
  }

  preload () {
    this.game.load.image('logo', 'assets/logo.png')
    this.game.load.start()
  }

  create () {
    this.state.start(Game.STATE_SPLASH)
  }
}
