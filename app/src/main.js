const { app, Menu, BrowserWindow, shell, net } = require('electron');
const path = require('path');
const url = require('url');
const { startServer } = require('./oauth');

const FileWatcher = require('./file');
const config = require('./config');
const personium = require('./personium');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({ width: 800, height: 600});
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true,
  }));

  Menu.setApplicationMenu(menu);
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', () => {
  createWindow();
});

app.on('window-all-closed', () => {
  if ( process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
})

const startOAuth = () => {
  shell.openExternal(OAUTH_URL)
}

const template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Open',
        accelerator: 'Command+O',
        click: () => {
          personium.getToken().then(tokendat => {
            const fileWatcher = new FileWatcher(config.localPath, `${config.cellURL}${config.targetBox}`, tokendat.access_token );
          });
        }
      }
    ]
  }, {
    label: 'View',
    submenu: [
      {
        label: 'Toggle DevTools',
        accelerator: 'Alt+Command+I',
        click: ()=> {
          BrowserWindow.getFocusedWindow().toggleDevTools();
        }
      }
    ]
  }
];

const menu = Menu.buildFromTemplate(template);