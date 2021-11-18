// Ersetzt in node_modules/@angular-devkit/build-angular/src/webpack/configs/browser.js durch /src/assets/webpack/patch/browser.js
// Ersetzt in node_modules/util/utils.js durch /src/assets/util/patch/util.js
//
// Autor: Wilhelm Frank
// adapted: SP

const path = require('path');
const fs = require('fs');
const fsp = require('fs/promises');

const file2replace1 = path.join(__dirname, 'node_modules', '@angular-devkit', 'build-angular', 'src', 'webpack', 'configs', 'browser.js');
const filename1 = path.basename(file2replace1);
const replacement1 = path.join(__dirname, 'src', 'assets', 'webpack', 'patch', filename1);
const backupTarget1 = path.join(__dirname, 'src', 'assets', 'webpack', 'backup');

const file2replace2 = path.join(__dirname, 'node_modules', 'util', 'util.js');
const filename2 = path.basename(file2replace2);
const replacement2 = path.join(__dirname, 'src', 'assets', 'util', 'patch', filename2);
const backupTarget2 = path.join(__dirname, 'src', 'assets', 'util', 'backup');

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

const patch1 = async () => {
  try {
    const backup = await existsOrCreate(backupTarget1);
    await fsp.copyFile(file2replace1, path.resolve(backup, filename1));
    const replace = await existsOrTerminate(replacement1);
    if (replace) {
      await fsp.copyFile(replacement1, file2replace1);
      return 'DONE!';
    } else {
      return 'MISSING REPLACEMENT!';
    }
  } catch (e) {
    throw e;
  }
};

patch1().then(console.log).catch((err) => console.log(err));

const patch2 = async () => {
  try {
    const backup = await existsOrCreate(backupTarget2);
    await fsp.copyFile(file2replace2, path.resolve(backup, filename2));
    const replace = await existsOrTerminate(replacement2);
    if (replace) {
      await fsp.copyFile(replacement2, file2replace2);
      return 'DONE!';
    } else {
      return 'MISSING REPLACEMENT!';
    }
  } catch (e) {
    throw e;
  }
};

patch2().then(console.log).catch((err) => console.log(err));
