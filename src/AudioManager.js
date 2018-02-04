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
    this.photoSFX = this.game.add.audio('photo')
    this.winSFX = this.game.add.audio('win')
    this.loseSFX = this.game.add.audio('lose')
    this.timeSFX = this.game.add.audio('time')

    this.tigerTake = this.game.add.audio('tigerTake')
    this.zebraTake = this.game.add.audio('zebraTake')
    this.snakeTake = this.game.add.audio('snakeTake')
    this.rhinoTake = this.game.add.audio('rhinoTake')
    this.monkeyTake = this.game.add.audio('monkeyTake')
    this.lionTake = this.game.add.audio('lionTake')
    this.hippoTake = this.game.add.audio('hippoTake')
    this.giraffeTake = this.game.add.audio('giraffeTake')
    this.elephantTake = this.game.add.audio('elephantTake')
    this.eagleTake = this.game.add.audio('eagleTake')

    this.tigerWrong = this.game.add.audio('tigerWrong')
    this.zebraWrong = this.game.add.audio('zebraWrong')
    this.snakeWrong = this.game.add.audio('snakeWrong')
    this.rhinoWrong = this.game.add.audio('rhinoWrong')
    this.monkeyWrong = this.game.add.audio('monkeyWrong')
    this.lionWrong = this.game.add.audio('lionWrong')
    this.hippoWrong = this.game.add.audio('hippoWrong')
    this.giraffeWrong = this.game.add.audio('giraffeWrong')
    this.elephantWrong = this.game.add.audio('elephantWrong')
    this.eagleWrong = this.game.add.audio('eagleWrong')

    this.tigerSuccess = this.game.add.audio('tigerSuccess')
    this.zebraSuccess = this.game.add.audio('zebraSuccess')
    this.snakeSuccess = this.game.add.audio('snakeSuccess')
    this.rhinoSuccess = this.game.add.audio('rhinoSuccess')
    this.monkeySuccess = this.game.add.audio('monkeySuccess')
    this.lionSuccess = this.game.add.audio('lionSuccess')
    this.hippoSuccess = this.game.add.audio('hippoSuccess')
    this.giraffeSuccess = this.game.add.audio('giraffeSuccess')
    this.elephantSuccess = this.game.add.audio('elephantSuccess')
    this.eagleSuccess = this.game.add.audio('eagleSuccess')

    this.sounds.push(this.photoSFX)
    this.sounds.push(this.winSFX)
    this.sounds.push(this.loseSFX)
    this.sounds.push(this.timeSFX)

    this.sounds.push(this.tigerSuccess)
    this.sounds.push(this.zebraSuccess)
    this.sounds.push(this.snakeSuccess)
    this.sounds.push(this.rhinoSuccess)
    this.sounds.push(this.monkeySuccess)
    this.sounds.push(this.lionSuccess)
    this.sounds.push(this.hippoSuccess)
    this.sounds.push(this.giraffeSuccess)
    this.sounds.push(this.elephantSuccess)
    this.sounds.push(this.eagleSuccess)

    this.sounds.push(this.tigerWrong)
    this.sounds.push(this.zebraWrong)
    this.sounds.push(this.snakeWrong)
    this.sounds.push(this.rhinoWrong)
    this.sounds.push(this.monkeyWrong)
    this.sounds.push(this.lionWrong)
    this.sounds.push(this.hippoWrong)
    this.sounds.push(this.giraffeWrong)
    this.sounds.push(this.elephantWrong)
    this.sounds.push(this.eagleWrong)

    this.sounds.push(this.tigerTake)
    this.sounds.push(this.zebraTake)
    this.sounds.push(this.snakeTake)
    this.sounds.push(this.rhinoTake)
    this.sounds.push(this.monkeyTake)
    this.sounds.push(this.lionTake)
    this.sounds.push(this.hippoTake)
    this.sounds.push(this.giraffeTake)
    this.sounds.push(this.elephantTake)
    this.sounds.push(this.eagleTake)

    this.game.sound.setDecodedCallback(this.sounds, this.onDecode, this)
  }

  play (key) {
    if (this.decoded && this.isEnabled) {
      this[key].play()
      return this[key]
    }
  }

  onDecode () {
    console.log('Decoded')
    this.decoded = true
  }
}
