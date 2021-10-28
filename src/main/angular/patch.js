const path = require('path');
const fs = require('fs');
const fsp = require('fs/promises');

const file2replace = path.join(__dirname, 'node_modules', '@angular-devkit', 'build-angular', 'src', 'webpack', 'configs', 'browser.js');
const filename = path.basename(file2replace);
const replacement = path.join(__dirname, 'src', 'assets', 'webpack', 'patch', filename);
const backupTarget = path.join(__dirname, 'src', 'assets', 'webpack', 'backup');

const existsOrCreate = (folderPath) => {
  return new Promise((resolve, reject) => {
    fs.stat(folderPath, (err) => {
      if (err) {
        if (err.code === 'ENOENT') {
          fs.mkdir(folderPath, {recursive: true}, (err) => {
            if (err) {
              reject(err);
            } else {
              resolve(folderPath);
            }
          });
        } else {
          reject(err);
        }
      } else {
        resolve(folderPath);
      }
    });
  });
};

const existsOrTerminate = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err) => {
      if (err) {
        if (err.code === 'ENOENT') {
          resolve(false);
        } else {
          reject(err);
        }
      } else {
        resolve(true);
      }
    });
  });
};

const patch = async () => {
  try {
    const backup = await existsOrCreate(backupTarget);
    await fsp.copyFile(file2replace, path.resolve(backup, filename));
    const replace = await existsOrTerminate(replacement);
    if (replace) {
      await fsp.copyFile(replacement, file2replace);
      return 'DONE!';
    } else {
      return 'MISSING REPLACEMENT!';
    }
  } catch (e) {
    throw e;
  }
};

patch().then(console.log).catch((err) => console.log(err));
