# Tomaca

An easy and free pomodoro timer app that runs on the tray with a popover using
[Electron](http://electron.atom.io).

Built with [photon](http://photonkit.com).

## Running

There is a binary with the latest release [here](https://github.com/tonipenya/tomaca/releases/download/1.0/Tomaca.zip). 
Otherwise, to run from source:

```sh
git clone https://github.com/tonipenya/tomaca
cd tomaca
npm install
npm start
```

## Packaging

```sh
npm run package
open out/Tomaca-darwin-x64/Tomaca.app
```

![pomodoro-screenshot](https://user-images.githubusercontent.com/191486/45946599-9ef9e180-bff1-11e8-8f0e-485ade71440f.png)
![break-screenshot](https://user-images.githubusercontent.com/191486/45946598-9ef9e180-bff1-11e8-842e-1bbf12036763.png)

## Acknowledgments
This project was originally based in https://github.com/kevinsawicki/tray-example.
