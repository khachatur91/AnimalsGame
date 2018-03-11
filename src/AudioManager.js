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
    this.isEnabled = true

    if (enforcer !== singletonEnforcer) {
      throw new TypeError('Cannot construct singleton')
    }
    this.game = window.game
    this.sounds = []
    this.commads = []
    this.decoded = false

    // this.game.sound.setDecodedCallback(this.sounds, this.onDecode, this)
  }

  play (key) {
    if (this.isEnabled) {
      const sound = this.game.sound.play(key)
      return sound
    }
  }

  onDecode () {
    console.log('Decoded')
    this.decoded = true
  }
}
