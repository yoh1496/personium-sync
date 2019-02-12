const chokidar = require('chokidar');
const webdav = require('webdav');
const https = require('https');
const agent = require('./common/net');
const request = require('request-promise');
const promisify = require('util').promisify;
const fs = require('fs');
const readFileAsync = promisify(fs.readFile);
const path = require('path');
const Immutable = require('immutable');

webdav.axios = require('axios').create({proxy: false});

class WebDavSyncer {
  constructor(localPath, targetBox, access_token) {
    console.log(agent);
    this.results = new Immutable.OrderedMap();
    this.calceled = false;
    this.targetBox = targetBox;
    this.localPath = localPath;
    this.currentTask = Promise.resolve();
    this.webdavClient = webdav.createClient(targetBox, {
      token: {token_type: 'Bearer', access_token},
      httpAgent: agent,
      httpsAgent: agent,
    });
    this.fsWatcher = chokidar.watch(localPath, {
      persistent: false,
      ignoreInitial: true,
      cwd: localPath,
    });

    this.fsWatcher.on('all', (event, evPath) => {
      this.appendQueue(event, evPath);
    })

    // this.fsWatcher.on('add', (event, evPath) => {
    //   // const req = https.request(new URL(evPath, this.targetBox), {
    //   //   agent, method: 'PROPFIND',
    //   // }, res => {
    //   //   res.on('data', chunk => {
    //   //     console.log('BODY',chunk)
    //   //   });
    //   //   res.on('end', () => {
    //   //     console.log('res end');
    //   //   });
    //   //   res.on('error', err => {
    //   //     console.log('err', err);
    //   //   });
    //   // });
    //   // req.on('error', (e) => {
    //   //   console.error(`problem with request: ${e.message}`);
    //   // });
    //   // req.end();

    //   // this.webdavClient.getDirectoryContents('/').then(console.log).catch(err => {
    //   //   console.log('err', err);
    //   // });

    //   // webdav.request(`${this.targetBox}/${evPath}`, {
    //   //   method: 'PROPFIND',
    //   //   agent: agent,
    //   // }).then((res) => res.json())
    //   // .then(console.log)
    //   // .catch(err => {
    //   //   console.log('err', err);
    //   // });
    // })
  }

  appendQueue(event, evPath) {
    const taskId = this.results.count();
    console.log('task queued: ', taskId, event);
    this.results = this.results.set(taskId, {event, evPath, result: null});
    // 終わってから実行することを担保したい
    this.currentTask =  this.currentTask.then(() => {
      console.log('task started: ', taskId);
      return this.execQueue(event, evPath).then((result) => {
        this.results = this.results.set(taskId, {event, evPath, result});
        console.log('task ended: ', taskId, result);
      });
    });
  }

  async execQueue(event, evPath) {
    switch(event) {
      case 'add':
        return (async () => {
          try {
            const stat = await this.webdavClient.stat(evPath, { details: true });
            console.log(stat);
            // 更新する
          } catch(err) {
            console.log(err);
            if (err.response.status) {
              // 新しく作る
            }
          }
          const buff = await readFileAsync(path.join(this.localPath, evPath));
          const result = await this.webdavClient.putFileContents(
            evPath, buff, { overwrite: true },
          );
          return 'created successfully';
        })();
      break;
      case 'addDir':
        return (async () => {
          try {
            const stat = await this.webdavClient.stat(evPath, { details: true});
            console.log(stat);
            // exists
            return 'already exists';
          } catch(err) {
            console.log(err);
            if (err.response.status) {
              // 新しく作る
            }
          }
          try{
            const result = await this.webdavClient.createDirectory(evPath);
            return 'folder created successfully';  
          } catch(err) {
            return JSON.stringify(err.response.data);
          }
        })();
      break;
      default:
        return 'unknown event';
      break;
    }
  }
}



class FileWatcher {
  constructor() {
    this.fsWatcher = null;
  }

  startWatch(dir) {
    if(this.fsWatcher) this.stopWatch();
    this.fsWatcher = chokidar.watch(dir, {
      persistent: true,
      ignoreInitial: true,
      cwd: dir,
    });
    this.fsWatcher.on('all', (event, path) => {
      console.log(event, path);
    });
  }
  stopWatch() {
    this.fsWatcher.close();
    this.fsWatcher = null;
  }
}

module.exports = WebDavSyncer;