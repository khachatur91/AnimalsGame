# Wheel Of Fortune Slot Machine.
<img src="https://github.com/khachatur91/wheelFortune/blob/master/preview.jpg">

## Technology
- ESLINT with JavaScript Standard Style configuration
- Next generation of Javascript (ES6)
- Phaser game engine
- Webpack ready
- Multiple browser testin

# Setup
<p>install all dependencies       - npm install</p>
<p>development server run command - npm run dev</p>
<p>build for deployment           - npm run deploy</p>

# Game
The game is kind of a mix of slot machine and wheel of fortune

Click "Play" to spin the wheel

Blur effect is implemented for the wheel, while it's spinning

When all reals reach to their max speed, "Stop" button becomes active

Click "Stop" to stop the wheel

3 main raws are differed with a light on the wheel.
In circular environment items from different raws are going farther from each other, that's why 
an additional popup appears where all those items tween and make a proper 3 lines for slot proper view.
After popup disappears, "Play" button becomes active

# Scenes
Game has 2 scenes BootState and GameState

### BootState
Responsible for showing a logo and loading assets

### GameState
All the interesting stuff happens here

# Code Structure
For the Wheel component it's used an MVC design. WheelModel is made in GameState, which is passed to WheelController and WheelView. WheelModel has Phaser.Signals which are the main way for communication bettwen Controller and View.

# Complex solutions
#### Blur effect while spinning in GameState

```javascript
preRender () {
    if (this.isRolling) {
      this.frames[this.frameIndex].cls()
      this.frames[this.frameIndex].copyRect(
        this.game.canvas, this.world.bounds, 0, 0, 0.1
      )
      this.frameIndex++
      if (this.frameIndex === this.framesForBlur) {
        this.start = true
        this.frameIndex = 0
      }
    }
  }

  render () {
    if (this.isRolling && this.start) {
      for (let i = 0; i < this.framesForBlur; i++) {
        this.game.context.drawImage(this.frames[i].canvas, 0, 0)
      }
    }
  }
  ```
  
  Store the canvas bitmapdata for last 10 frames with alpha = 0.1 in frames array with appropriate index, and render them while the wheel is spinning. Current implementation copies all canvas pixels, but because of the environment is static, this solution works. The ideal solution would copy only WheelView pixels.
  
 #### Set result index for each reel in ReelView
 In GameState we set a pattern for result middle raw in this snipet in GameState. Patterns can be get from the backend in the future.
 ```javascript 
 
  setResultPattern () {
    let randomPatternIndex = this.game.rnd.integerInRange(0, this.resultPatterns.length - 1)
    this.controller.setPatternToRoll(this.resultPatterns[randomPatternIndex])
  }
 ```
 
 ... which in final state sets the result index for each reel
 
 ```javascript
   setDestinationIndex (index) {
    index = index || this.game.rnd.integerInRange(0, this.parts.length - 1)
    this.currentItemIndex = index
    let rotationSteps = this.game.rnd.integerInRange(1, 2) * this.parts.length + index

    this.toRotation = this.sectorAngle * rotationSteps

    this.gridItems.push(this.items[(this.currentItemIndex - 1 + this.parts.length) % this.parts.length])
    this.gridItems.push(this.items[this.currentItemIndex])
    this.gridItems.push(this.items[(this.currentItemIndex + 1) % this.parts.length])
  }

  stopRotation () {
    if (!this.isRotating) {
      return
    }
    if (this.tween && this.tween.isRunning) {
      this.tween.stop()
    }

    this.tween = this.game.add.tween(this)
    this.convertRotationRange2PI()
    let duration = this.game.rnd.integerInRange(2000, 3000)

    this.currentAngularSpeed = 0
    this.isRotating = false
    this.tween.to({rotation: this.toRotation}, duration, Phaser.Easing.Quadratic.Out, true)
    this.tween.onComplete.add(this.onRotationComplete, this)
  }
  ```
  
  in the code above the final rotation is calculated of the reel, and when it is stopped, the reel tweens it's current rotation to final rotation. Duration and Ease function values of the tween make the switch process (spinning with maxSpeed to tween to final rotation) very smooth.
  
  #### Append a custom math function to game.math in BootState
  
  ```javascript
  this.game.math.convertRotationRange2PI = this.convertRotationRange2PI
  

  // wrap current rotation to appropriate one in range 0 - 2*PI
  convertRotationRange2PI (rotation) {
    return this.degToRad((this.radToDeg(rotation) % 360))
  }
  ```
  # Assets
  
  Besides the general atlas and sfx files in assets folder are two json files
  
  #### resultPatterns.json
  ```javascript
  {
  "patterns": [
    [1, 2, 3, 4, 5],
    [2, 2, 2, 2, 2],
    [5, 4, 3, 2, 1]
  ]
}
```
... array of result patterns randomly choosen in the game

#### reelsData.json
```javascript
{
"reels": [
    [
      "redItem",
      "greenItem",
      "purpleItem",
      "orangeItem",
      ...
    ],
    [
      "redItem",
      "greenItem",
      ...
    ]
    ...
 ]
 }
 ```
 Data represents the content of each reel. In each array are stored item keys.

  
  
