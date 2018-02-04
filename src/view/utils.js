export function timeToMMSS (time) {
  let minutes = Math.floor(time / 60)
  let seconds = time - (minutes * 60)

  if (minutes < 10) { minutes = '0' + minutes }
  if (seconds < 10) { seconds = '0' + seconds }
  return minutes + ':' + seconds
}

export function shuffle (array) {
  let currentIndex = array.length
  let temporaryValue, randomIndex

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1

    temporaryValue = array[currentIndex]
    array[currentIndex] = array[randomIndex]
    array[randomIndex] = temporaryValue
  }

  return array
}
