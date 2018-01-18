/**
 * Created by khachatur on 6/29/17.
 */
import Phaser from 'phaser'

export default class WheelModel {
  static WHEEL_STOP_STATE = 1
  static WHEEL_START_STATE = 2
  static WHEEL_STOP_PROCESSING_STATE = 3

  constructor () {
    this.color = null
    this.onRotateStateChange = new Phaser.Signal() // Wheel rotation state changed - accepts one parameter state, which values are defined in WheelModel
    this.onDataSet = new Phaser.Signal() // Reels content data is set
    this.onPatternSet = new Phaser.Signal() // Result pattern is set
    this.onWheelSpeedMax = new Phaser.Signal() // All wheel reels reach their max speed
  }

  setReelsData (reelsData) {
    this.reelsData = reelsData
    this.onDataSet.dispatch(reelsData)
  }

  setWheelRollPattern (patternArray) {
    this.patternArray = patternArray
    this.onPatternSet.dispatch(patternArray)
  }

  setWheelSpeedOnMax () {
    this.onWheelSpeedMax.dispatch()
  }

  setWheelRotateState (rotationState) {
    this.rotationState = rotationState
    this.onRotateStateChange.dispatch(rotationState)
  }
}
