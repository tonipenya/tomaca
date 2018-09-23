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
let pomodoroDuration = 10000
let timeLeft = pomodoroDuration
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
  timeLeft = pomodoroDuration
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
  progressRing = document.getElementById('progress-value');
  progressRing.style.strokeDasharray = CIRCUMFERENCE;
}

function startProgressRing() {
  progressRing.style.transitionDuration = pomodoroDuration + 'ms';
  progressRing.style.strokeDashoffset = CIRCUMFERENCE
}

function resetProgressRing() {
  progressRing.style.transitionDuration = '1s';
  progressRing.style.strokeDashoffset = 0
}

function initPreferencesControls() {
  preferencesPane = document.getElementById('preferences')
  preferencesActions = document.getElementById('preferences-actions')
  document
    .getElementById('preferences-btn')
    .addEventListener('click', togglePreferences)
  document
    .getElementById('preferences-cancel')
    .addEventListener('click', togglePreferences)
  document
    .getElementById('preferences-save')
    .addEventListener('click', savePreferences)
}

function togglePreferences() {
  document.getElementById('pomodoro-duration').value = pomodoroDuration / 1000
  preferencesPane.classList.toggle('hidden')
  preferencesActions.classList.toggle('hidden')
  appActions.classList.toggle('hidden')
}

function savePreferences() {
  pomodoroDuration = Number(document.getElementById('pomodoro-duration').value) * 1000
  togglePreferences()
  stopTimer()
}

function humanReadableTime(millis) {
  const seconds = millis / 1000
  const wholeMinutes = Math.trunc(seconds / 60)
  const remainderSeconds = seconds - wholeMinutes * 60

  return `${padLeft(wholeMinutes, '0', 2)}:${padLeft(remainderSeconds, '0', 2)}`
}

function padLeft(string, pad, length) {
  return (new Array(length+1).join(pad) + string).slice(-length);
}
