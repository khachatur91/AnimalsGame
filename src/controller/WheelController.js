/**
 * Created by khachatur on 6/29/17.
 */
import Phaser from 'phaser'
import WheelModel from '../model/WheelModel'

export default class WheelController {
  constructor (model) {
    this.model = model
    this.model.onRotateStateChange.add(this.onRotateStateChangeListener, this)
    this.model.onWheelSpeedMax.add(this.onWheelSpeedMaxListener, this)

    this.onWheelStop = new Phaser.Signal()
    this.onWheelReachMaxSpeed = new Phaser.Signal()
  }

  onRotateStateChangeListener (rotateState) {
    switch (rotateState) {
      case WheelModel.WHEEL_START_STATE:
        break
      case WheelModel.WHEEL_STOP_STATE:
        this.onWheelStop.dispatch()
        break
      case WheelModel.WHEEL_STOP_PROCESSING_STATE:
        break
    }
  }

  onWheelSpeedMaxListener () {
    this.onWheelReachMaxSpeed.dispatch()
  }

  setData (reelsData) {
    this.model.setReelsData(reelsData)
  }

  rotateWheel () {
    this.model.setWheelRotateState(WheelModel.WHEEL_START_STATE)
  }

  stopWheel () {
    this.model.setWheelRotateState(WheelModel.WHEEL_STOP_PROCESSING_STATE)
  }

  setPatternToRoll (patternArray) {
    this.model.setWheelRollPattern(patternArray)
  }

}
