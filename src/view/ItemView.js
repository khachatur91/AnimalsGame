/**
 * Created by khachatur on 6/29/17.
 */
import Phaser from 'phaser'

export default class ItemView extends Phaser.Image {

  constructor (game, key) {
    super(game, 0, 0, 'general', key)

    this.onShakeStop = new Phaser.Signal()
    this.anchor.setTo(0.5)
    this.scale.setTo(0.6)
  }

  startShake () {
    let tween = this.game.add.tween(this)
    tween.onComplete.add(this.onShakeComplete, this)
    tween.to({x: this.position.x + 10}, 2000, this.shakeEasing.bind(this), true, this.game.rnd.integerInRange(0, 1000))
  }

  tweenTo (x, y, callback) {
    let duration = this.game.rnd.integerInRange(1000, 1500)
    let delay = this.game.rnd.integerInRange(0, 1500)
    let tween = this.game.add.tween(this)
    tween.to({x: x, y: y}, duration, Phaser.Easing.Back.Out, true, delay)
    tween.onStart.add(this.onTweenStartListener, this)
    if (callback) {
      tween.onComplete.add(callback)
    }
    let scaleTween = this.game.add.tween(this.scale)
    scaleTween.to({x: 1, y: 1}, duration, Phaser.Easing.Bounce.Out, true, delay)
  }

  onTweenStartListener () {
    this.visible = true
  }

  // Custom shake easing function
  shakeEasing (progress) {
    return this.shake(progress, 10, 8)
  }

  shake (progress, period1, period2) {
    var current1 = progress * Math.PI * 2 * period1
    var current2 = progress * (Math.PI * 2 * period2 + Math.PI / 2)

    return Math.sin(current1) * Math.cos(current2)
  }

  onShakeComplete () {
    this.onShakeStop.dispatch()
  }
}
