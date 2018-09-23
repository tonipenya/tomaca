const {ipcRenderer, shell} = require('electron')

document.addEventListener('DOMContentLoaded', init)

let playButton
let pauseButton
let preferencesPane
let appActions
let preferencesActions
let progressRing
let UPDATE_INTERVAL = 1000
var RADIUS = 122;
var CIRCUMFERENCE = 2 * Math.PI * RADIUS;
let timerDuration = 10000
let timeLeft = timerDuration
var timerIntervalId

function init() {
  initAppConttrols()
  initStartStopControls()
  initPreferencesControls()
  initProgressRing()
  updateLabels()
}

function initAppConttrols(){
  appActions = document.getElementById('app-actions')
  document.getElementById('quit-btn').addEventListener('click', window.close)
}

function initStartStopControls() {
  playButton = document.getElementById('play')
  stopButton = document.getElementById('stop')
  playButton.addEventListener('click', startTimer)
  stopButton.addEventListener('click', stopTimer)
}

function startTimer() {
  clearInterval(timerIntervalId)
  playButton.classList.add('hidden')
  stopButton.classList.remove('hidden')
  startProgressRing()
  updateLabels()

  timerIntervalId = setInterval(() => {
    timeLeft -= UPDATE_INTERVAL
    updateLabels()

    if (timeLeft <= 0) {
      finishTimer()
    }
  }, UPDATE_INTERVAL)
}

function finishTimer() {
  clearInterval(timerIntervalId)
  const notification = new Notification('Time\'s up', {
    body: `Your timer has finished.`
  })
  notification.onclick = () => {
    ipcRenderer.send('show-window')
  }
}

function stopTimer() {
  timeLeft = timerDuration
  playButton.classList.remove('hidden')
  stopButton.classList.add('hidden')
  clearInterval(timerIntervalId)
  resetProgressRing()
  updateLabels()
}

function updateLabels() {
  const labelText = humanReadableTime(timeLeft)
  ipcRenderer.send('timer-updated', labelText)
  document.getElementById('countdown-number').innerHTML = labelText
}

function initProgressRing() {
  progressRing = document.querySelector('.progress-value');
  progressRing.style.strokeDasharray = CIRCUMFERENCE;
}

