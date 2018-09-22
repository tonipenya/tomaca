const {ipcRenderer, shell} = require('electron')

document.addEventListener('DOMContentLoaded', init)

let playButton
let pauseButton
let preferencesPane
let appActions
let preferencesActions
let timerDuration = 10000
let timeLeft = timerDuration
const UPDATE_INTERVAL = 500
var timerIntervalId
var running = false

function init() {
  playButton = document.getElementById('play')
  stopButton = document.getElementById('stop')
  preferencesPane = document.getElementById('preferences')
  appActions = document.getElementById('app-actions')
  preferencesActions = document.getElementById('preferences-actions')
  playButton.addEventListener('click', startTimer)
  stopButton.addEventListener('click', stopTimer)
  document.getElementById('quit-btn').addEventListener('click', window.close)
  document.getElementById('preferences-btn').addEventListener('click', togglePreferences)
  document.getElementById('preferences-cancel').addEventListener('click', togglePreferences)
  document.getElementById('preferences-save').addEventListener('click', savePreferences)


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
  timeLeft = timerDuration
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

