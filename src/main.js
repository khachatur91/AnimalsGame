/**
 * Created by User on 07.07.2017.
 */
import Phaser from 'phaser'
import BootState from './states/BootState'
import GameState from './states/GameState'
import SplashState from './states/SplashState'
import config from './config'

export default class Game extends Phaser.Game {
  static STATE_BOOT = 'Boot'
  static STATE_SPLASH = 'Splash'
  static STATE_GAME = 'Game'

  constructor () {
    super(config.gameWidth, config.gameHeight, Phaser.CANVAS, '', null)
    this.state.add(Game.STATE_BOOT, BootState, false)
    this.state.add(Game.STATE_SPLASH, SplashState, false)
    this.state.add(Game.STATE_GAME, GameState, false)
    this.state.start(Game.STATE_BOOT)
  }
}

window.game = new Game()
