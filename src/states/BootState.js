import Phaser from 'phaser'
import Game from '../main'
import WebFont from 'webfontloader'

export default class BootState extends Phaser.State {
  init () {
    this.fontsReady = false
    this.fontsLoaded = this.fontsLoaded.bind(this)

    const lang = this.getParameterByName('lang')
    this.game.lang = lang || 'en'

    this.game.renderer.renderSession.roundPixels = true

    this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL
    this.game.scale.pageAlignHorizontally = true
    this.game.scale.pageAlignVertically = true
  }

  getParameterByName (name, url) {
    if (!url) url = window.location.href
    name = name.replace(/[\[\]]/g, '\\$&')
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url)
    if (!results) return null
    if (!results[2]) return ''
    return decodeURIComponent(results[2].replace(/\+/g, ' '))
  }

  preload () {
    WebFont.load({
      google: {
        families: ['Luckiest Guy']
      },
      active: this.fontsLoaded
    })
    this.game.load.image('logo', 'assets/logo.png')
    this.game.load.start()
  }

  render () {
    if (this.fontsReady) {
      this.state.start(Game.STATE_SPLASH)
    }
  }

  fontsLoaded () {
    this.fontsReady = true
  }
}
