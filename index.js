const {ipcRenderer, shell} = require('electron')

let timeLeft = 10000
const UPDATE_INTERVAL = 500

var timerIntervalId = setInterval(() => {
  timeLeft -= UPDATE_INTERVAL

  const secondsLeft = Math.trunc(timeLeft / 1000)
  ipcRenderer.send('timer-updated', secondsLeft)
  document.getElementById('countdown').innerHTML = secondsLeft

  if (timeLeft <= 0) {
    clearInterval(timerIntervalId)
  }
}, UPDATE_INTERVAL)

