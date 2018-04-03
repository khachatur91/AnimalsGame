import Phaser from 'phaser'
import PhaserNineSlice from '../lib/phaser-nineslice'

export default class TutorPopup extends Phaser.Group {
  constructor (game, animalsList) {
    super(game)
    this.submitAction = new Phaser.Signal()
    this.animalsList = animalsList
    this.animalNames = []
    this.createUI()
  }

  createUI () {
    const graph = this.game.make.graphics()
    graph.beginFill(0, 0.5)
    graph.drawRect(0, 0, this.game.width, this.game.height)
    graph.endFill()

    this.background = this.game.add.image(0, 0, graph.generateTexture(), '', this)
    this.background.inputEnabled = true

    this.panel = new PhaserNineSlice.NineSlice(
            this.game,           // Phaser.Game
      this.game.width / 2,            // x position
      this.game.height / 2,            // y position
            'ui',      // atlas key
            'popupBg', // Image frame
            600,            // expected width
            800,            // expected height
      { // And this is the framedata, normally this is passed when preloading. Check README for details
        top: 20,    // Amount of pixels for top
        bottom: 20, // Amount of pixels for bottom
        left: 20,   // Amount of pixels for left
        right: 20   // Amount of pixels for right
      }
    )
    this.panel.anchor.set(0.5, 0.5)
    this.add(this.panel)

    this.animalsList.forEach((animalData, index) => {
      const lang = this.game.lang

      const animalName = this.game.add.text(0, -300 + index * 60, animalData[lang], {font: '75px Luckiest Guy', fill: '#ffffff'}, this)
      animalName.inputEnabled = true
      animalName.events.onInputDown.add(() => {
        this.animalNames[this.selectedIndex].fill = '#ffffff'
        this.selectedIndex = this.animalNames.indexOf(animalName)
        this.selectedIndex = (this.selectedIndex + this.animalNames.length) % this.animalNames.length
        this.animalNames[this.selectedIndex].fill = '#ffc600'
      }, this)
      animalName.anchor.set(0.5, 0.5)
      animalName.setShadow(-2, 2, 'rgba(0,0,0,0.5)', 4)
      this.panel.addChild(animalName)
      this.animalNames.push(animalName)
    })

    this.selectedIndex = 0
    this.animalNames[this.selectedIndex].fill = '#ffc600'

    this.submitButton = this.game.add.sprite(this.game.width / 2, this.game.height / 2 + 330, 'ui', 'submit', this)
    this.submitButton.inputEnabled = true
    this.submitButton.anchor.set(0.5, 0.5)
    this.submitButton.events.onInputDown.add(this.onSubmit, this)

    this.submitLabel = this.game.add.text(0, 0, 'SUBMIT', {font: '50px Luckiest Guy', fill: '#ffffff'}, this)
    this.submitLabel.anchor.set(0.5, 0.5)
    this.submitLabel.setShadow(-2, 2, 'rgba(0,0,0,0.5)', 4)
    this.submitButton.addChild(this.submitLabel)

    const key1 = this.game.input.keyboard.addKey(Phaser.Keyboard.UP)
    key1.onDown.add(this.selectNameUp, this)

    const key2 = this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN)
    key2.onDown.add(this.selectNameDown, this)

    const key3 = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER)
    key3.onDown.add(this.onSubmit, this)
  }

  selectNameUp () {
    this.animalNames[this.selectedIndex].fill = '#ffffff'
    this.selectedIndex --
    this.selectedIndex = (this.selectedIndex + this.animalNames.length) % this.animalNames.length
    this.animalNames[this.selectedIndex].fill = '#ffc600'
  }

  selectNameDown () {
    this.animalNames[this.selectedIndex].fill = '#ffffff'
    this.selectedIndex ++
    this.selectedIndex = this.selectedIndex % this.animalNames.length
    this.animalNames[this.selectedIndex].fill = '#ffc600'
  }

  onSubmit () {
    this.submitAction.dispatch(this.animalsList[this.selectedIndex].key)
    this.visible = false
  }
}
