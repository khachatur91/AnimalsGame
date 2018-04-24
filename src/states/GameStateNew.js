import Phaser from 'phaser'

import AudioManager from '../AudioManager'
import Client from '../client'
import GameView from '../view/GameView'
import AnimalName from '../view/AnimalName'
import StatusPopup from '../view/StatusPopup'
import TutorPopup from '../view/TutorPopup'

export default class GameState extends Phaser.State {
  static STATE_IN_GAME = 0
  static STATE_PAUSED = 2

  static USER_STUDENT = 1
  static USER_TUTOR = 2

  onNewPlayer (data) {
    console.log(data)
  }

  onConnected () {
    console.log('CONNECTED')
    if (this.user === GameState.USER_TUTOR) {
      this.statusPopup.visible = false
      this.tutorPopup.visible = true
    } else {
      this.statusPopup.updateText('WAITING FOR TUTOR')
    }
  }

  onDisconnected (data) {
    console.log('DISCONNECTED: ' + data.message)
    this.statusPopup.visible = true
    this.statusPopup.updateText(data.message.toUpperCase())
  }

  onSelectAnimalReceived (data) {
    this.gameState = GameState.STATE_IN_GAME
    this.statusPopup.visible = false
    this.animalsList.forEach((animalData, index) => {
      if (animalData.key === data.name) {
        this.currentAnimalIndex = index
        this.showUI()
      }
    })
    this.updateAnimal()
  }

  onClickReceived (data) {
    if (data.selectedAnimal.length === 0) {
      if (data.page === 0) {
        this.scrollLeftStep()
      } else {
        this.scrollRightStep()
      }
    } else {
      this.takeScreenshot(data.selectedAnimal, {x: data.x, y: data.y})
    }
  }

  init () {
    if (this.game.user === 'student') {
      this.user = GameState.USER_STUDENT
    } else if (this.game.user === 'tutor') {
      this.user = GameState.USER_TUTOR
    }
    this.client = new Client(this)
    this.client.signalClick.add(this.onClickReceived, this)
    this.client.signalSelectAnimal.add(this.onSelectAnimalReceived, this)
    this.client.signalConnected.add(this.onConnected, this)
    this.client.signalDisconnected.add(this.onDisconnected, this)

    this.client.connectUser(this.game.type, this.game.user, this.game.roomID)

    this.game.stage.disableVisibilityChange = true
    // default settings
    this.settings = {
      enableVoice: false,
      enableLabel: true,
      enablePinyin: false
    }

    this.stage.backgroundColor = '#9df6e4'

    this.levelAnimals = this.game.cache.getJSON('gameData').levels
    this.animalsLocale = this.game.cache.getJSON('locale')
    console.log(this.animalsLocale)
    this.levelBackground = this.game.cache.getJSON('backgroundData').levels

    this.currentPage = 0

    this.audioManager = AudioManager.instance

    this.animalsList = this.levelAnimals[0]

    this.currentAnimalIndex = 0

    this.gameView = new GameView(this.game, this.levelAnimals, this.levelBackground)
    this.game.world.add(this.gameView)
    this.gameView.signalAnimalClick.add(this.onAnimalClick, this)
    this.createPhotoFrame()
    this.createUI()

    this.statusPopup = new StatusPopup(this.game)
    this.statusPopup.updateText('CONNECTING')
    this.game.add.existing(this.statusPopup)

    if (this.user === GameState.USER_TUTOR) {
      this.tutorPopup = new TutorPopup(this.game, this.levelAnimals[0])
      this.tutorPopup.submitAction.add((animalKey) => {
        this.client.selectAnimal(animalKey)
      }, this)
      this.game.add.existing(this.tutorPopup)
      this.tutorPopup.visible = false
    }
  }

  screenshot (addLabel, position) {
    if (!this.settings.enableVoice) {
      this.gameState = GameState.STATE_PAUSED
    }
    this.audioManager.play('photo')
    const pos = position

    const tweenPalaroid = this.game.add.tween(this.palaroidFrame)
    tweenPalaroid.to({rotation: (Math.random() - 0.5) * Math.PI / 6 + Math.PI * 6, x: this.game.width / 2, y: this.game.height / 2}, 700, Phaser.Easing.Quadratic.In, true, 300)
    tweenPalaroid.onStart.add(() => {
      this.palaroidFrame.visible = true
      this.palaroidFrame.scale.set(0.2, 0.2)
      const tween = this.game.add.tween(this.palaroidFrame.scale)
      tween.to({x: 1, y: 1}, 700)
      tween.start()
    })
    tweenPalaroid.start()

    tweenPalaroid.onComplete.add(() => {
      setTimeout(() => {
        this.palaroidFrame.visible = false
        this.palaroidFrame.rotation = 0
        this.palaroidFrame.position.set(0, 0)
        this.createPhotoFrame()
        if (!this.settings.enableVoice) {
          this.gameState = GameState.STATE_IN_GAME
        }
      }, 2000)
    })

    this.hideUI()

    window.requestAnimationFrame(() => {
      let x = Math.min(Math.max(0, pos.x - 256), this.game.width - 512)
      let y = Math.min(Math.max(0, pos.y - 256), this.game.height - 512)

      const data = this.game.context.getImageData(x, y, 512, 512)

      this.palaroidBitmapData.ctx.putImageData(data, 0, 0)

      const pic = this.game.add.image(0, -50, this.palaroidBitmapData.texture)
      pic.anchor.set(0.5, 0.5)
      this.palaroidFrame.addChild(pic)
      if (addLabel) {
        const key = this.animalsList[this.currentAnimalIndex].key
        const animalName = this.game.add.text(0, this.palaroidFrame.height / 2.5, ' ' + this.animalsLocale[key].name.toUpperCase() + ' ')
        animalName.font = 'Luckiest Guy'
        animalName.fontSize = 60
        // animalName.setShadow(-2, 2, 'rgba(0,0,0,0.5)', 4)
        animalName.fill = '#d8ab25'
        animalName.stroke = '#000000'
        animalName.strokeThickness = 4
        animalName.anchor.set(0.5, 0.5)
        this.palaroidFrame.addChild(animalName)
      }

      const flashTween = this.game.add.tween(this.flash)
      flashTween.to({alpha: 1}, 100)
        .to({alpha: 0}, 100)
      flashTween.start()
    })
  }

  scrollRightStep () {
    if (this.buttonTween.isRunning) {
      this.buttonTween.stop()
    }

    this.currentPage = 1
    this.gameView.scrollRightStep()
    if (this.user === GameState.USER_STUDENT) {
      this.client.sendClick(0, 0, this.currentPage, '')
    }
    this.rightButton.visible = false
    this.leftButton.visible = true
  }

  scrollLeftStep () {
    this.currentPage = 0
    if (this.user === GameState.USER_STUDENT) {
      this.client.sendClick(0, 0, this.currentPage, '')
    }
    this.gameView.scrollLeftStep()
    this.leftButton.visible = false
    this.rightButton.visible = true
  }

  hideUI () {
    this.photoFrame.visible = false
    this.rightButton.visible = false
    this.leftButton.visible = false
    this.nameFrame.visible = false
  }

  showUI () {
    this.photoFrame.visible = true
    if (this.currentPage === 0) {
      this.rightButton.visible = true
    } else {
      this.leftButton.visible = true
    }
    // When the sound is turned off, the label should become visible here and not after sound finishes
    this.nameFrame.visible = this.settings.enableLabel
  }

  createUI () {
    this.photoFrame = this.game.add.group()

    this.nameFrame = new AnimalName(this.game)
    this.game.add.existing(this.nameFrame)
    this.nameFrame.visible = false
    this.rightButton = this.game.add.button(this.game.width - 100, this.game.height / 3, 'ui', this.user === GameState.USER_STUDENT ? this.scrollRightStep : null, this, 'nextButton', 'nextButton', 'nextButton', 'nextButton')
    this.rightButton.anchor.set(1, 0.5)
    this.rightButton.visible = false

    this.buttonTween = this.game.add.tween(this.rightButton).to({ y: this.rightButton.y + 20 }, 200, 'Linear', true, 0, -1, true)
    this.buttonTween.start()

    this.leftButton = this.game.add.button(100, this.game.height / 3, 'ui', this.user === GameState.USER_STUDENT ? this.scrollLeftStep : null, this, 'nextButton', 'nextButton', 'nextButton', 'nextButton')
    this.leftButton.anchor.set(1, 0.5)
    this.leftButton.scale.x = -1
    this.leftButton.visible = false

    const grph = this.game.make.graphics(0, 0)
    grph.beginFill(0xffffff, 1)
    grph.drawRect(0, 0, this.game.width, this.game.height)
    grph.endFill()

    this.flash = this.game.add.image(0, 0, grph.generateTexture())
    this.flash.alpha = 0
  }

  takeScreenshot (frameName, position) {
    if (this.gameState !== GameState.STATE_IN_GAME) {
      return
    }

    this.gameState = GameState.STATE_PAUSED
    // Reset the timer for take sound

    if (this.user === GameState.USER_STUDENT) {
      this.client.sendClick(position.x, position.y, this.currentPage, frameName)
    }
    // Correct selection
    if (this.animalsList[this.currentAnimalIndex].key === frameName) {
      if (this.currentSound) {
        this.currentSound.stop()
      }

      setTimeout(() => {
        this.gameState = GameState.STATE_IN_GAME
        this.currentAnimalIndex ++
        this.showUI()
        if (this.currentAnimalIndex === this.animalsList.length) {
          this.audioManager.play('win')
          this.onLevelComplete()
        } else if (this.gameState === GameState.STATE_IN_GAME) {
          this.nameFrame.visible = this.settings.enableLabel

          this.hideUI()

          if (this.user === GameState.USER_TUTOR) {
            this.gameState = GameState.STATE_PAUSED
            this.tutorPopup.visible = true
          } else {
            this.gameState = GameState.STATE_PAUSED
            this.statusPopup.updateText('WAITING FOR TUTOR')
            this.statusPopup.visible = true
          }
        }
      }, 3000)

      this.screenshot(true, position)
    } else { // Wrong selection
      if (this.currentSound) {
        this.currentSound.stop()
      }
      setTimeout(() => {
        this.gameState = GameState.STATE_IN_GAME
        this.showUI()
      }, 3000)

      this.screenshot(false, position)
    }
  }

  onAnimalClick (data) {
    if (this.user === GameState.USER_TUTOR) {
      return;
    }
    const mousePosition = this.game.input.activePointer.position
    this.takeScreenshot(data.frameName, mousePosition)
  }

  updateAnimal () {
    const key = this.animalsList[this.currentAnimalIndex].key
    const label = this.animalsLocale[key].name.toUpperCase()
    const pinyin = this.animalsLocale[key]['pinyin'] || ''
    this.nameFrame.updateText(label, pinyin)
  }

  createPhotoFrame () {
    this.palaroidBitmapData = this.game.make.bitmapData(512, 512)
    this.palaroidFrame = this.game.add.sprite(0, 0, 'ui', 'palaroidFrame')
    this.palaroidFrame.visible = false
    this.palaroidFrame.anchor.set(0.5, 0.5)
    this.palaroidFrame.rotation = Math.PI / 10
  }
}
