/**
 * Created by khachatur on 6/29/17.
 */

// eslint-disable-next-line symbol-description
const singleton = Symbol()
// eslint-disable-next-line symbol-description
const singletonEnforcer = Symbol()

export default class AudioManager {

  static get instance () {
    if (!this[singleton]) {
      this[singleton] = new AudioManager(singletonEnforcer)
    }
    return this[singleton]
  }

  constructor (enforcer) {
    if (enforcer !== singletonEnforcer) {
      throw new TypeError('Cannot construct singleton')
    }
    this.game = window.game
    this.sounds = []
    this.commads = []
    this.decoded = false
    this.revealSFX = this.game.add.audio('reveal')
    this.spinSFX = this.game.add.audio('spin')
    this.sounds.push(this.revealSFX)
    this.sounds.push(this.spinSFX)
    this.game.sound.setDecodedCallback(this.sounds, this.onDecode, this)
  }

  fadeIn (key, duration, loop, marker) {
    if (!this.hasOwnProperty(key)) {
      console.warn('Can\'t find audio key \'' + key + '\'')
      return
    }
    if (this.decoded) {
      this[key].fadeIn(duration, loop, marker)
    } else {
      this.commads.push({
        context: this[key],
        command: this[key].fadeIn,
        duration: duration,
        loop: loop,
        marker: marker
      })
    }
  }

  fadeOut (key) {
    if (!this.hasOwnProperty(key)) {
      console.warn('Can\'t find audio key \'' + key + '\'')
      return
    }
    this[key].fadeOut()
  }

  play (key) {
    console.log(this)
    if (this.decoded) {
      this[key].play()
    }
  }

  getSound (key) {
    return this[key]
  }

  onDecode () {
    this.decoded = true
    this.commads.forEach((value, index) => {
      value.command.call(value.context, value.duration, value.loop, value.marker)
    })
  }
}
