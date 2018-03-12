import Phaser from 'phaser'

import {shuffle} from '../view/utils'
import AudioManager from '../AudioManager'
import SettingsPopup from '../view/SettingsPopup'
import RestartPopup from '../view/RestartPopup'
import Client from '../client'
import GameView from '../view/GameView'
import Timer from '../view/Timer'
import AnimalName from '../view/AnimalName'
import StatusPopup from '../view/StatusPopup'
import TutorPopup from '../view/TutorPopup'

export default class GameState extends Phaser.State {
  static STATE_IN_GAME = 0
  static STATE_LEVEL_COMPLETE = 1
  static STATE_PAUSED = 2
  static STATE_INIT = 3

  static MODE_SINGLE = 1
  static MODE_STUDENT = 2

  static USER_STUDENT = 1
  static USER_TUTOR = 2

  static SOUND_REPEAT_DURATION = 10000;
  static SCROLL_SPEED = 10;
  static SCROLL_DURATION = 2000;

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
  }

  onSelectAnimalReceived (data) {
    this.statusPopup.visible = false
    console.log(`animal select: ${data.name}`)
    this.animalsList.forEach((animalData, index) => {
      if (animalData.key === data.name) {
        this.currentAnimalIndex = index
        this.showUI()
      }
    })
    this.updateAnimal()
  }

  onClickReceived (data) {
    console.log(`click received: ${data.x} ${data.y}`)
  }

  init () {
    if (this.game.roomID && this.game.user) {
      this.mode = GameState.MODE_STUDENT
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
    } else {
      this.mode = GameState.MODE_SINGLE
    }

    this.game.stage.disableVisibilityChange = true
    // default settings
    this.settings = {
      enableVoice: true,
      enableLabel: true,
      enablePinyin: false
    }

    this.stage.backgroundColor = '#9df6e4'

    this.levelAnimals = this.game.cache.getJSON('gameData').levels
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

    this.gameState = GameState.STATE_INIT

    if (this.mode === GameState.MODE_SINGLE) {
      this.settingsPopup = new SettingsPopup(this.game)
      this.settingsPopup.submitAction.add(this.onSettings, this)
      this.game.add.existing(this.settingsPopup)

      this.restartPopup = new RestartPopup(this.game)
      this.restartPopup.submitAction.add(this.onRestart, this)
      this.game.add.existing(this.restartPopup)
      this.restartPopup.visible = false
    } else {
      this.statusPopup = new StatusPopup(this.game)
      this.statusPopup.updateText('CONNECTING')
      this.game.add.existing(this.statusPopup)

      if (this.user === GameState.USER_TUTOR) {
        this.tutorPopup = new TutorPopup(this.game, this.levelAnimals[0])
        this.tutorPopup.submitAction.add((animalKey) => {
          console.log(animalKey)
          this.client.selectAnimal(animalKey)
        }, this)
        this.game.add.existing(this.tutorPopup)
        this.tutorPopup.visible = false
      }
    }
  }

  onSecondTrigger (timeRemained) {
    this.takeSoundTime ++
    if (this.takeSoundTime > GameState.SOUND_REPEAT_DURATION) {
      this.takeSoundTime = 0
      this.playTakeSound()
    }

    switch (timeRemained) {
      case 15:
        if (this.currentSound && this.currentSound.isPlaying) {
          this.currentSound.onStop.addOnce(() => {
            this.currentSound = this.audioManager.play('time')
          })
        } else {
          this.currentSound = this.audioManager.play('time')
        }
        break
      case 0:
        this.onTimerComplete()
        break
    }
  }

  onTimerComplete () {
    if (this.currentSound && this.currentSound.isPlaying) {
      this.currentSound.onStop.addOnce(() => {
        this.onLevelComplete()
        this.audioManager.play('lose')
      })
    } else {
      this.onLevelComplete()
      this.audioManager.play('lose')
    }
  }
  onRestart () {
    this.photosContainer.removeChildren()
    this.photosContainer.visible = false
    this.photosContainer.destroy()
    this.startLevel()
  }

  onSettings (data) {
    this.settings = data
    this.audioManager.isEnabled = this.settings.enableVoice
    this.nameFrame.visible = this.settings.enableLabel

    this.nameFrame.setPinyuin(this.settings.enablePinyin)
    if (this.settings.enablePinyin) {
      this.nameFrame.y = this.game.height
    } else {
      this.nameFrame.y = this.game.height + 30
    }

    if (this.gameState === GameState.STATE_INIT) {
      this.startLevel()
    }
    this.gameState = GameState.STATE_IN_GAME
  }

  startLevel () {
    this.currentAnimalIndex = 0
    shuffle(this.animalsList)

    this.showUI()

    this.gameState = GameState.STATE_IN_GAME
    this.timer.resume()
    this.photoList = []

    this.currentTime = 0
    this.takeSoundTime = 0

    this.updateAnimal()

    this.playTakeSound()
  }

  onLevelComplete () {
    this.gameState = GameState.STATE_LEVEL_COMPLETE

    this.photosContainer = this.game.add.group()
    this.photoList.forEach((item, index) => {
      this.photosContainer.add(item)
      item.scale.set(0.3, 0.3)
      item.visible = true
      item.position.x = index * 150
      item.rotation = Math.random() * Math.PI / 8 - Math.PI / 16
    })
    this.photosContainer.updateTransform()
    this.photosContainer.x = (this.game.width - this.photosContainer.width) / 2 + (this.photoList[0] ? this.photoList[0].width / 2 : 0)
    this.photosContainer.y = 800
    this.restartPopup.visible = true
    this.restartPopup.setAnimalsAmount(this.currentAnimalIndex)

    this.hideUI()
  }

  playTakeSound () {
    if (this.currentSound && this.currentSound.isPlaying) {
      this.currentSound.onStop.addOnce(() => {
        this.currentSound = this.audioManager.play(this.animalsList[this.currentAnimalIndex].key + 'Take')
      })
    } else {
      this.currentSound = this.audioManager.play(this.animalsList[this.currentAnimalIndex].key + 'Take')
    }
  }

  screenshot (addLabel) {
    if (!this.settings.enableVoice) {
      this.gameState = GameState.STATE_PAUSED
    }
    this.audioManager.play('photo')
    const pos = this.game.input.activePointer.position

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
        const animalName = this.game.add.text(0, this.palaroidFrame.height / 2.5, ' ' + this.animalsList[this.currentAnimalIndex][this.game.lang].toUpperCase() + ' ')
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
    this.gameView.scrollRightStep()

    this.rightButton.visible = false
    this.leftButton.visible = true
  }

  scrollLeftStep () {
    this.gameView.scrollLeftStep()
    this.leftButton.visible = false
    this.rightButton.visible = true
  }

  hideUI () {
    if (this.mode === GameState.MODE_SINGLE) {
      this.settingsButton.visible = false
    }
    this.photoFrame.visible = false
    this.rightButton.visible = false
    this.leftButton.visible = false
    this.timer.visible = false
    this.nameFrame.visible = false
  }

  showUI () {
    if (this.mode === GameState.MODE_SINGLE) {
      this.settingsButton.visible = true
    }
    this.photoFrame.visible = true
    if (this.currentPage === 0) {
      this.rightButton.visible = true
    } else {
      this.leftButton.visible = true
    }
    // When the sound is turned off, the label should become visible here and not after sound finishes
    console.log(this.settings.enableLabel)
    this.nameFrame.visible = this.settings.enableLabel

    this.timer.visible = true
  }

  createUI () {
    this.photoFrame = this.game.add.group()

    if (this.mode === GameState.MODE_SINGLE) {
      this.settingsButton = this.game.add.button(20, 20, 'ui', this.onSettingsButtonClicked, this, 'settings', 'settings', 'settings', 'settings')
    }

    this.timer = new Timer(this.game, 105)
    this.timer.signalSecondTrigger.add(this.onSecondTrigger, this)
    this.timer.visible = false

    this.nameFrame = new AnimalName(this.game)
    this.game.add.existing(this.nameFrame)
    this.nameFrame.visible = false

    this.rightButton = this.game.add.button(this.game.width - 100, this.game.height / 3, 'ui', this.scrollRightStep, this, 'nextButton', 'nextButton', 'nextButton', 'nextButton')
    this.rightButton.anchor.set(1, 0.5)
    this.rightButton.visible = false

    this.buttonTween = this.game.add.tween(this.rightButton).to({ y: this.rightButton.y + 20 }, 200, 'Linear', true, 0, -1, true)
    this.buttonTween.start()

    this.leftButton = this.game.add.button(100, this.game.height / 3, 'ui', this.scrollLeftStep, this, 'nextButton', 'nextButton', 'nextButton', 'nextButton')
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

  onSettingsButtonClicked () {
    this.gameState = GameState.STATE_PAUSED
    this.settingsPopup.visible = true
  }

  onAnimalClick (data) {
    if (this.user === GameState.USER_STUDENT) {
      this.client.sendClick(100, 100, this.currentPage, data.frameName)
    }

    if (this.gameState !== GameState.STATE_IN_GAME) {
      return
    }

    this.gameState = GameState.STATE_PAUSED
    this.timer.pause()
    // Reset the timer for take sound
    this.takeSoundTime = 0
    // Correct selection
    if (this.animalsList[this.currentAnimalIndex].key === data.frameName) {
      if (this.currentSound) {
        this.currentSound.stop()
      }

      // change the state to stop the timer, if the game is finished
      if (this.currentAnimalIndex === this.animalsList.length - 1) {
        this.gameState = GameState.STATE_LEVEL_COMPLETE
      }
      this.playSound(this.animalsList[this.currentAnimalIndex].key + 'Success', () => {
        this.gameState = GameState.STATE_IN_GAME
        this.timer.resume()
        this.currentAnimalIndex ++
        this.showUI()
        if (this.currentAnimalIndex === this.animalsList.length) {
          this.audioManager.play('win')
          this.onLevelComplete()
        } else if (this.gameState === GameState.STATE_IN_GAME) {
          this.nameFrame.visible = this.settings.enableLabel

          this.updateAnimal()
          this.playTakeSound()
        }
      })
      this.photoList.push(this.palaroidFrame)

      this.screenshot(true)
    } else { // Wrong selection
      if (this.currentSound) {
        this.currentSound.stop()
      }
      this.playSound(this.animalsList[this.currentAnimalIndex].key + 'Wrong', () => {
        this.gameState = GameState.STATE_IN_GAME
        this.showUI()
        this.timer.resume()
      })

      this.screenshot(false)
    }
  }

  update () {
    this.timer.update()
  }

  updateAnimal () {
    const label = this.animalsList[this.currentAnimalIndex][this.game.lang].toUpperCase()
    const pinyin = this.animalsList[this.currentAnimalIndex]['pinyin'].toUpperCase()
    this.nameFrame.updateText(label, pinyin)
  }

  playSound (key, callback) {
    if (this.settings.enableVoice) {
      this.currentSound = this.audioManager.play(key)
      this.currentSound.onStop.addOnce(callback, this)
    } else {
      setTimeout(callback.bind(this), 2500)
    }
  }

  createPhotoFrame () {
    this.palaroidBitmapData = this.game.make.bitmapData(512, 512)
    this.palaroidFrame = this.game.add.sprite(0, 0, 'ui', 'palaroidFrame')
    this.palaroidFrame.visible = false
    this.palaroidFrame.anchor.set(0.5, 0.5)
    this.palaroidFrame.rotation = Math.PI / 10
  }
}
