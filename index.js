const {ipcRenderer, shell} = require('electron')

document.addEventListener('DOMContentLoaded', init)

let playButton
let pauseButton
let preferencesPane
let appActions
let preferencesActions
let progressRing
let timeLeft
var timerIntervalId
let UPDATE_INTERVAL = 1000
var RADIUS = 122;
var CIRCUMFERENCE = 2 * Math.PI * RADIUS;
let pomodoroTimer = {
  label: 'Pomodoro',
  duration: 25 * 60 * 1000,
  color: '#ff9b9b'
}
let breakTimer = {
  label: 'Break',
  duration: 5 * 60 * 1000,
  color: '#b8e0b8'
}
let timers = [pomodoroTimer, breakTimer]

function init() {
  initCurrentTimer()
  initAppConttrols()
  initStartStopControls()
  initPreferencesControls()
  initProgressRing()
  updateLabels()
}

function initCurrentTimer() {
  timeLeft = timers[0].duration
  document.getElementById('progress-value').style.stroke = timers[0].color
  document.getElementById('task-label').textContent = timers[0].label
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
      stopTimer()
      notifyTimerFinished()
    }
  }, UPDATE_INTERVAL)
}

function notifyTimerFinished() {
  const notification = new Notification('Time\'s up', {
    body: `Your timer has finished.`
  })
  notification.onclick = () => {
    ipcRenderer.send('show-window')
  }
}

function rotateTimers() {
  const head = timers.shift()
  timers.push(head)
}

function stopTimer() {
  rotateTimers()
  initCurrentTimer()
  playButton.classList.remove('hidden')
  stopButton.classList.add('hidden')
  clearInterval(timerIntervalId)
  resetProgressRing()
  updateLabels()
}

function updateLabels() {
  const labelText = humanReadableTime(timeLeft)
  ipcRenderer.send('timer-updated', labelText)
  document.getElementById('countdown-number').textContent = labelText
}

function initProgressRing() {
  progressRing = document.getElementById('progress-value');
  progressRing.style.strokeDasharray = CIRCUMFERENCE;
}

function startProgressRing() {
  progressRing.style.transitionDuration = timers[0].duration + 'ms';
  progressRing.style.strokeDashoffset = CIRCUMFERENCE
}

function resetProgressRing() {
  progressRing.style.transitionDuration = '500ms';
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
  document.getElementById('pomodoro-duration').value = pomodoroTimer.duration / 1000
  document.getElementById('break-duration').value = breakTimer.duration / 1000
  preferencesPane.classList.toggle('hidden')
  preferencesActions.classList.toggle('hidden')
  appActions.classList.toggle('hidden')
}

function savePreferences() {
  pomodoroTimer.duration = Number(document.getElementById('pomodoro-duration').value) * 1000
  breakTimer.duration = Number(document.getElementById('break-duration').value) * 1000
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
