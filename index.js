const {ipcRenderer, shell} = require('electron')

document.addEventListener('DOMContentLoaded', init)

let playButton
let pauseButton
let timeLeft = 10000
const UPDATE_INTERVAL = 500
var timerIntervalId
var running = false

function init() {
  playButton = document.getElementById('play')
  stopButton = document.getElementById('stop')
  playButton.addEventListener('click', startTimer)
  stopButton.addEventListener('click', stopTimer)

  stopTimer()
}

function startTimer() {
  timerIntervalId = setInterval(() => {
    timeLeft -= UPDATE_INTERVAL

    if (timeLeft <= 0) {
      clearInterval(timerIntervalId)
    }

    running = true
    updateInterface()
  }, UPDATE_INTERVAL)
  updateInterface()
}

function stopTimer() {
  timeLeft = 10000
  running = false
  clearInterval(timerIntervalId)
  updateInterface()
}

function updateInterface() {
  const secondsLeft = Math.trunc(timeLeft / 1000)
  ipcRenderer.send('timer-updated', secondsLeft)
  document.getElementById('countdown').innerHTML = secondsLeft

  if (running) {
    playButton.classList.add('hidden')
    stopButton.classList.remove('hidden')
  } else {
    playButton.classList.remove('hidden')
    stopButton.classList.add('hidden')
  }
}

