const {ipcRenderer} = require('electron')

document.addEventListener('DOMContentLoaded', init)

let playButton
let pauseButton
let appActions
let progressRing
let timeLeft
var timerIntervalId
let prefs
let UPDATE_INTERVAL = 1000
var RADIUS = 122;
var CIRCUMFERENCE = 2 * Math.PI * RADIUS;
let pomodoroTimer = {
  label: 'Pomodoro',
  duration: minutesInMillis(25),
  color: '#ff9b9b'
}
let breakTimer = {
  label: 'Break',
  duration: minutesInMillis(5),
  color: '#b8e0b8'
}
let timers = [pomodoroTimer, breakTimer]

function init() {
  prefs = new Preferences()
  initCurrentTimer()
  initAppConttrols()
  initStartStopControls()
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
  const trayLabel = (timeLeft == timers[0].duration)? '' : labelText
  ipcRenderer.send('timer-updated', trayLabel)
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

function millisInMinutes(millis) {
  return millis / 1000 / 60
}

function minutesInMillis(minutes) {
  return minutes * 60 * 1000
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

class Preferences {
  // TODO: reduce coupling with outside world (appActions, pomodoroTimer, breakTimer)
  // TODO: extract to a different file
  constructor() {
    this.paneElem = document.getElementById('preferences')
    this.actions = document.getElementById('preferences-actions')
    this.pomodoroDurationElem = document.getElementById('pomodoro-duration')
    this.breakDurationElem = document.getElementById('break-duration')
    document
      .getElementById('preferences-btn')
      .addEventListener('click', () => this.toggle())
    document
      .getElementById('preferences-cancel')
      .addEventListener('click', () => this.toggle())
    document
      .getElementById('preferences-save')
      .addEventListener('click', () => this.save())
  }

  get pomodoroDuration() {
    return minutesInMillis(Number(this.pomodoroDurationElem.value))
  }

  set pomodoroDuration(duration) {
    this.pomodoroDurationElem.value = millisInMinutes(duration)
  }

  get breakDuration() {
    return minutesInMillis(Number(this.breakDurationElem.value))
  }

  set breakDuration(duration) {
    this.breakDurationElem.value = millisInMinutes(duration)
  }

  toggle() {
    this.pomodoroDuration = pomodoroTimer.duration
    this.breakDuration = breakTimer.duration
    this.paneElem.classList.toggle('hidden')
    this.actions.classList.toggle('hidden')
    appActions.classList.toggle('hidden')
  }

  save() {
    pomodoroTimer.duration = this.pomodoroDuration
    breakTimer.duration = this.breakDuration
    this.toggle()
    stopTimer()
  }
}
