import Phaser from 'phaser'
import { timeToMMSS } from './utils'

export default class Timer extends Phaser.Group {
  static STATE_PAUSED = 1;
  static STATE_RUNNING = 1;

  constructor (game, totalTime) {
    super(game)
    this.totalTime = totalTime
    this.timeRemained = totalTime
    this.state = Timer.STATE_PAUSED
    this.init()
  }

  init () {
    this.signalSecondTrigger = new Phaser.Signal()

    this.timerFrame = this.game.add.sprite(this.game.width / 2, 0, 'ui', 'timerFrame')
    this.timerFrame.anchor.x = 0.5
    this.timerLabel = this.game.add.text(0, 10, '00:00', {font: '40px Luckiest Guy'})
    this.timerLabel.anchor.x = 0.5
    this.timerLabel.fontSize = 50
    this.timerLabel.fill = '#ffffff'
    this.timerFrame.addChild(this.timerLabel)
  }

  reset () {
    this.timeRemained = this.totalTime
  }

  pause () {
    this.state = Timer.STATE_PAUSED
  }

  resume () {
    this.state = Timer.STATE_RUNNING
  }

  update () {
    if (this.state === Timer.STATE_PAUSED) {
      return
    }
    this.currentTime += this.time.elapsed

    if (this.currentTime > 1000) {
      this.currentTime = this.currentTime % 1000
      this.signalSecondTrigger.dispatch(this.timeRemained)
      this.timeRemained --
      this.timerLabel.text = timeToMMSS(this.timeRemained)

      if (this.timeRemained === 0) {
        this.pause()
      }
    }
  }
}
