import Phaser from 'phaser'
import Game from '../main'
import WebFont from 'webfontloader'

export default class BootState extends Phaser.State {
  init () {
    this.fontsReady = false
    this.fontsLoaded = this.fontsLoaded.bind(this)

    const lang = this.getParameterByName('lang')
    const type = this.getParameterByName('type')

    this.game.lang = lang || 'en'
    this.game.type = type || 'safari'

    this.game.renderer.renderSession.roundPixels = true

    this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL
    this.game.scale.pageAlignHorizontally = true
    this.game.scale.pageAlignVertically = true

    // this.initSpeech()
  }

  initSpeech () {
    var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
    var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
    var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent

    var colors = [ 'aqua', 'azure', 'beige', 'bisque', 'black', 'blue', 'brown', 'chocolate', 'coral', 'crimson', 'cyan', 'fuchsia', 'ghostwhite', 'gold', 'goldenrod', 'gray', 'green', 'indigo', 'ivory', 'khaki', 'lavender', 'lime', 'linen', 'magenta', 'maroon', 'moccasin', 'navy', 'olive', 'orange', 'orchid', 'peru', 'pink', 'plum', 'purple', 'red', 'salmon', 'sienna', 'silver', 'snow', 'tan', 'teal', 'thistle', 'tomato', 'turquoise', 'violet', 'white', 'yellow']
    var grammar = '#JSGF V1.0; grammar colors; public <color> = ' + colors.join(' | ') + ' ;'

    var recognition = new SpeechRecognition()
    var speechRecognitionList = new SpeechGrammarList()
    speechRecognitionList.addFromString(grammar, 1)
    recognition.grammars = speechRecognitionList
// recognition.continuous = false;
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    document.body.onclick = function () {
      recognition.start()
      console.log('Ready to receive a color command.')
    }

    recognition.onresult = function (event) {
      // The SpeechRecognitionEvent results property returns a SpeechRecognitionResultList object
      // The SpeechRecognitionResultList object contains SpeechRecognitionResult objects.
      // It has a getter so it can be accessed like an array
      // The [last] returns the SpeechRecognitionResult at the last position.
      // Each SpeechRecognitionResult object contains SpeechRecognitionAlternative objects that contain individual results.
      // These also have getters so they can be accessed like arrays.
      // The [0] returns the SpeechRecognitionAlternative at position 0.
      // We then return the transcript property of the SpeechRecognitionAlternative object

      var last = event.results.length - 1
      var color = event.results[last][0].transcript

      console.log('Result received: ' + color + '.')
      console.log('Confidence: ' + event.results[0][0].confidence)
    }

    recognition.onspeechend = function () {
      recognition.stop()
    }

    recognition.onnomatch = function (event) {
      console.log("I didn't recognise that color.")
    }

    recognition.onerror = function (event) {
      console.log('Error occurred in recognition: ' + event.error)
    }
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
