import Phaser from 'phaser'

import AudioManager from '../AudioManager'
import {shuffle, timeToMMSS} from '../view/utils'
import SettingsPopup from '../view/SettingsPopup'
import RestartPopup from '../view/RestartPopup'

export default class GameState extends Phaser.State {
  static STATE_IN_GAME = 0
  static STATE_LEVEL_COMPLETE = 1
  static STATE_PAUSED = 2
  static STATE_INIT = 3

  static SOUND_REPEAT_DURATION = 10000;
  static SCROLL_SPEED = 10;
  static SCROLL_DURATION = 2000;

  init () {
    this.game.stage.disableVisibilityChange = true
    // default settings
    this.settings = {
      enableVoice: true,
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

    this.container1 = this.game.add.group()
    this.container2 = this.game.add.group()
    this.container3 = this.game.add.group()

    this.animalsList = this.levelAnimals[0]

    this.currentAnimalIndex = 0
    this.createBackground(this.levelBackground[0])

    this.createAnimals(this.levelAnimals[0])

    this.createPhotoFrame()
    this.createUI()

    this.gameState = GameState.STATE_INIT

    this.settingsPopup = new SettingsPopup(this.game)
    this.settingsPopup.submitAction.add(this.onSettings, this)
    this.game.world.add(this.settingsPopup)

    this.restartPopup = new RestartPopup(this.game)
    this.restartPopup.submitAction.add(this.onRestart, this)
    this.game.world.add(this.restartPopup)
    this.restartPopup.visible = false
  }

  update () {
    if (this.gameState === GameState.STATE_LEVEL_COMPLETE) {
      return
    }
    this.currentTime += this.time.elapsed

    if (this.gameState === GameState.STATE_IN_GAME) {
      this.takeSoundTime += this.time.elapsed
    }

    if (this.takeSoundTime > GameState.SOUND_REPEAT_DURATION) {
      this.takeSoundTime = 0
      this.playTakeSound()
    }

    if (this.currentTime > 1000) {
      this.currentTime = this.currentTime % 1000

      this.timeRemained --
      if (this.timeRemained === 15) {
        if (this.currentSound && this.currentSound.isPlaying) {
          this.currentSound.onStop.addOnce(() => {
            this.currentSound = this.audioManager.play('time')
          })
        } else {
          this.currentSound = this.audioManager.play('time')
        }
      }

      this.timerLabel.text = timeToMMSS(this.timeRemained)

      if (this.timeRemained === 0) {
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

    if (this.settings.enablePinyin) {
      this.nameFrame.y = this.game.height
      this.pinyuinLabel.visible = true
    } else {
      this.pinyuinLabel.visible = false
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
    this.photoList = []

    this.currentTime = 0
    this.takeSoundTime = 0

    this.timeRemained = 105
    this.timerLabel.text = timeToMMSS(this.timeRemained)
    const key = this.animalsList[this.currentAnimalIndex].key
    console.log(key)
    this.nameLabel.text = this.animalsLocale[key].name.toUpperCase()
    this.pinyuinLabel.text = this.animalsLocale[key]['pinyin'] || ''

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

    let tween = this.game.add.tween(this.container3)
    tween.to({x: -(4000 - this.game.canvas.width)}, GameState.SCROLL_DURATION)
    tween.start()

    tween = this.game.add.tween(this.container2)
    tween.to({x: -(3700 - this.game.canvas.width)}, GameState.SCROLL_DURATION)
    tween.start()

    tween = this.game.add.tween(this.container1)
    tween.to({x: -(3600 - this.game.canvas.width)}, GameState.SCROLL_DURATION)
    tween.start()

    this.rightButton.visible = false
    this.leftButton.visible = true
  }

  scrollLeftStep () {
    this.currentPage = 0

    let tween = this.game.add.tween(this.container3)
    tween.to({x: 0}, GameState.SCROLL_DURATION)
    tween.start()

    tween = this.game.add.tween(this.container2)
    tween.to({x: 0}, GameState.SCROLL_DURATION)
    tween.start()
    tween = this.game.add.tween(this.container1)
    tween.to({x: 0}, GameState.SCROLL_DURATION)
    tween.start()

    this.leftButton.visible = false
    this.rightButton.visible = true
  }

  hideUI () {
    this.settingsButton.visible = false
    this.photoFrame.visible = false
    this.rightButton.visible = false
    this.leftButton.visible = false
    this.timerFrame.visible = false
    this.nameFrame.visible = false
  }

  showUI () {
    this.settingsButton.visible = true
    this.photoFrame.visible = true
    if (this.currentPage === 0) {
      this.rightButton.visible = true
    } else {
      this.leftButton.visible = true
    }
    // When the sound is turned off, the label should become visible here and not after sound finishes
    this.nameFrame.visible = this.settings.enableLabel

    this.timerFrame.visible = true
  }

  createUI () {
    this.photoFrame = this.game.add.group()

    this.settingsButton = this.game.add.button(20, 20, 'ui', this.onSettingsButtonClicked, this, 'settings', 'settings', 'settings', 'settings')

    this.timerFrame = this.game.add.sprite(this.game.width / 2, 0, 'ui', 'timerFrame')
    this.timerFrame.anchor.x = 0.5
    this.timerLabel = this.game.add.text(0, 10, '00:00', {font: '40px Luckiest Guy'})
    this.timerLabel.anchor.x = 0.5
    this.timerLabel.fontSize = 50
    this.timerLabel.fill = '#ffffff'
    this.timerFrame.addChild(this.timerLabel)
    this.timerFrame.visible = false

    this.nameFrame = this.game.add.image(this.game.width / 2, this.game.height + 30, 'ui', 'nameFrame')
    this.nameFrame.anchor.x = 0.5
    this.nameFrame.anchor.y = 1
    this.nameFrame.visible = false

    this.nameLabel = this.game.add.text(0, -35, '', {font: 'Luckiest Guy'})
    this.nameLabel.anchor.x = 0.5
    this.nameLabel.anchor.y = 1
    this.nameLabel.fontSize = 50
    this.nameLabel.fill = '#ffffff'
    this.nameFrame.addChild(this.nameLabel)

    this.pinyuinLabel = this.game.add.text(0, -5, '')
    this.pinyuinLabel.anchor.x = 0.5
    this.pinyuinLabel.anchor.y = 1
    this.pinyuinLabel.fontSize = 30
    this.pinyuinLabel.fill = '#ffffff'
    this.nameFrame.addChild(this.pinyuinLabel)

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

  createAnimals (animals) {
    animals.forEach((animal) => {
      const image = this.game.add.image(animal.x, animal.y, 'animals', animal.key)
      image.inputEnabled = true

      image.events.onInputDown.add(this.onAnimalClick, this)

      image.scale = new Phaser.Point(animal.scale, Math.abs(animal.scale))
      image.anchor.set(0.5, 1)
      if (image.y > 806) {
        this.container3.addChild(image)
      } else {
        this.container2.addChild(image)
      }
    })
  }

  onAnimalClick (data) {
    if (this.gameState !== GameState.STATE_IN_GAME) {
      return
    }

    this.gameState = GameState.STATE_PAUSED

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
        this.currentAnimalIndex ++
        this.showUI()
        if (this.currentAnimalIndex === this.animalsList.length) {
          this.audioManager.play('win')
          this.onLevelComplete()
        } else if (this.gameState === GameState.STATE_IN_GAME) {
          this.nameFrame.visible = this.settings.enableLabel

          const key = this.animalsList[this.currentAnimalIndex].key
          this.nameLabel.text = this.animalsLocale[key].name.toUpperCase()
          this.pinyuinLabel.text = this.animalsLocale[key]['pinyin'] || ''
          this.playTakeSound()
        }
      })
      this.photoList.push(this.palaroidFrame)

      this.screenshot(true)
    } else { // Wrong selection
      if (this.currentSound) {
        this.currentSound.stop()
      }
      this.playSound(data.frameName + 'Wrong', () => {
        this.gameState = GameState.STATE_IN_GAME
        this.showUI()
      })

      this.screenshot(false)
    }
  }

  playSound (key, callback) {
    if (this.settings.enableVoice) {
      this.currentSound = this.audioManager.play(key)
      this.currentSound.onStop.addOnce(callback, this)
    } else {
      setTimeout(callback.bind(this), 2500)
    }
  }

  createBackground (items) {
    this.game.add.tileSprite(0, 0, 4000, 668, 'background', 'sky', this.container1)
    this.game.add.tileSprite(0, 383, 4000, 429, 'background', 'mountains', this.container1)
    this.game.add.tileSprite(-300, 580, 4300, 158, 'background', 'bgGreen', this.container1)
    this.game.add.tileSprite(0, 600, 4000, 158, 'background', 'bgGreen1', this.container2)
    this.game.add.tileSprite(0, 695, 4000, 274, 'background', 'ground2', this.container2)

    if (this.game.type === 'farm') {
      this.game.add.image(0, 710, 'background', 'fgGreen', this.container3)
    }
    this.game.add.tileSprite(0, 806, 4000, 274, 'background', 'ground1', this.container3)

    if (this.game.type === 'safari') {
      this.game.add.image(0, 866, 'background', 'groundColor1', this.container3)
      this.game.add.image(1186, 842, 'background', 'groundColor2', this.container3)
    }

    items.forEach((item) => {
      let image = this.game.add.image(item.x, item.y, 'background', item.key)
      if (item.key.substr(0, 4) === 'tree') {
        const shadow = this.game.add.image(item.x, item.y, 'background', 'shadow')
        image.position.set(0, 0)
        image.anchor.set(0.5, 1)
        image.scale.x = item.scale > 0 ? 1 : -1
        shadow.addChild(image)
        image = shadow
        image.scale = new Phaser.Point(Math.abs(item.scale), Math.abs(item.scale))
      } else {
        image.scale = new Phaser.Point(item.scale, Math.abs(item.scale))
      }
      if (item.y > 806) {
        this.container3.addChild(image)
      } else {
        this.container2.addChild(image)
      }
      image.anchor.set(0.5, 1)
    })
  }

  createPhotoFrame () {
    this.palaroidBitmapData = this.game.make.bitmapData(512, 512)
    this.palaroidFrame = this.game.add.sprite(0, 0, 'ui', 'palaroidFrame')
    this.palaroidFrame.visible = false
    this.palaroidFrame.anchor.set(0.5, 0.5)
    this.palaroidFrame.rotation = Math.PI / 10
  }
}
