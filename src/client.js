import io from 'socket.io-client'
import * as Phaser from 'phaser-ce'

const socket = io()

export default class Client {
  constructor () {
    this.signalClick = new Phaser.Signal()
    this.signalConnected = new Phaser.Signal()
    this.signalDisconnected = new Phaser.Signal()
    this.signalSelectAnimal = new Phaser.Signal()

    this.socket = socket

    this.socket.on('connected', () => {
      this.signalConnected.dispatch()
    })

    this.socket.on('disconnected', (data) => {
      this.signalDisconnected.dispatch(data)
    })

    this.socket.on('tutorSelectAnimal', (data) => {
      this.signalSelectAnimal.dispatch(data)
    })

    this.socket.on('studentClick', (data) => {
      this.signalClick.dispatch(data)
    })
  }
  /**
   * Connection request for the room (student,tutor request)
   * @param theme (farm, safari)
   * @param userType (student, tutor)
   * @param roomId
   */
  connectUser (theme, user, roomId) {
    this.socket.emit('connectUser', {theme, user, roomId})
  }
  /**
   * Send click data to the tutor (student request)
   * @param x
   * @param y
   */
  sendClick (x, y, page, selectedAnimal) {
    const data = {x, y, page, selectedAnimal}
    console.log(`sendClick ${data}`)
    this.socket.emit('studentClick', data)
  }

  /**
   * Request for selecting an animal (tutor request)
   * @param animalKey
   */
  selectAnimal (animalKey) {
    console.log(`selectAnimal ${animalKey}`)
    this.socket.emit('tutorSelectAnimal', {name: animalKey})
  }
}
