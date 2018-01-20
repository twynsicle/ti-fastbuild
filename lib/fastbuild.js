'use babel';
/* eslint-disable no-undef */

import { BufferedProcess } from 'atom';

const Promise = require('bluebird');

const fs = require('fs');

export default class FastBuild {

	constructor() {
		this.loadProjectProperties();
	}

	loadProjectProperties() {
		let projectDirectory = atom.project.getPaths()[0];
		let tiapp = projectDirectory + '\\tiapp.xml';
		fs.readFile(tiapp, (error, data) => {
			if (error) {
				console.log('error reading tiapp.xml');
				return;
			}
			let contents = data.toString();
			this.applicationName = contents.match(/<name>(\w*)<\/name>/)[1];
			this.applicationId = contents.match(/<id>([.\w]*)<\/id>/)[1];
		});
	}

	build(deviceId) {
		this.initFileNames();
		this.writeLine('Starting build...');
		let start = Date.now();
		return this.zipAlign()
			.then(() => {
				return this.sign();
			})
			.tap(() => { this.writeLine(`Build completed in ${((Date.now() - start) / 1000)}s`); })
			.then(() => {
				this.writeLine('Installing apk...');
				start = Date.now();
				return this.adbInstall(deviceId);
			})
			.tap(() => { this.writeLine(`Apk installed in ${((Date.now() - start) / 1000)}s`); })
			.then(() => {
				this.writeLine('Starting app...');
				return this.startApp(deviceId);
			})
			.delay(1000)
			.then(() => {
				return this.getPid();
			})
			.tap((pid) => this.attachToLogCat(deviceId, pid))
			.catch((e) => {
				console.error(e);
			});
	}

	initFileNames() {
		//TODO check if both exist
		let projectDirectory = atom.project.getPaths()[0];
		if (fs.existsSync(projectDirectory + '\\build\\android\\bin\\app-unsigned-dev-debug.apk')) {
			this.unsignedZip = projectDirectory + '\\build\\android\\bin\\app-unsigned-dev-debug.apk';
			this.alignedZip = projectDirectory + '\\build\\android\\bin\\app-unsigned-dev-debug.apkz';
			this.apkFile = projectDirectory + '\\build\\android\\bin\\' + this.applicationName + '-dev-debug.apk';
		} else {
			this.unsignedZip = projectDirectory + '\\build\\android\\bin\\app-unsigned.apk';
			this.alignedZip = projectDirectory + '\\build\\android\\bin\\app-unsigned.apkz';
			this.apkFile = projectDirectory + '\\build\\android\\bin\\' + this.applicationName + '.apk';
		}
	}

	zipAlign() {
		return new Promise((resolve, reject) => {
			new BufferedProcess({
				command: 'zipalign',
				args: [ '-f', '4', this.unsignedZip, this.alignedZip ],
				stdout: output => console.log(output),
				stderr: output => console.error(output),
				exit: code => {
					if (code === 0) {
						resolve();
					} else {
						reject('zipAlign failed');
					}
				}
			});
		});
	}

	sign() {
		return new Promise((resolve, reject) => {
			// TODO probably should sanity check that this file exists
			let keystore = 'C:\\ProgramData\\Titanium\\mobilesdk\\win32\\7.0.1.GA\\android\\dev_keystore';
			let keystoreStorePassword = 'pass:tirocks';
			new BufferedProcess({
				command: 'apksigner.bat',
				args: [ 'sign', '--ks', keystore, '--ks-pass', keystoreStorePassword, '--out', this.apkFile, this.alignedZip ],
				stdout: output => console.log(output),
				stderr: output => console.error(output),
				exit: code => {
					if (code === 0) {
						resolve();
					} else {
						reject('sign failed');
					}
				}
			});
		});
	}

	adbInstall(deviceId) {
		return new Promise((resolve, reject) => {
			new BufferedProcess({
				command: 'adb',
				args: [ '-s', deviceId, 'install', '-r', this.apkFile ],
				stdout: output => console.log(output),
				stderr: output => console.error(output),
				exit: code => {
					if (code === 0) {
						resolve();
					} else {
						reject('apk install failed');
					}
				}
			});
		});
	}

	startApp(deviceId) {
		return new Promise((resolve, reject) => {
			new BufferedProcess({
				command: 'adb',
				args: [ '-s', deviceId, 'shell', 'am', 'start', '-n', (this.applicationId + '/.' + this.getActivityName()) ],
				stdout: output => console.log(output),
				stderr: output => console.error(output),
				exit: code => {
					if (code === 0) {
						resolve();
					} else {
						reject('start app failed');
					}
				}
			});
		});
	}

	getActivityName() {
		// Taken from the sdk's _build.js
		let className = this.applicationName.split(/[^A-Za-z0-9_]/).map(function (word) {
			word = word.toLowerCase();
			return word.charAt(0).toUpperCase() + word.slice(1);
		}).join('');
		return (className + 'Activity').replace(/^\./, '');
	}

	getPid() {
		// Android 7.0+ only
		// https://stackoverflow.com/questions/15608876/find-out-the-running-process-id-by-package-name
		return new Promise((resolve, reject) => {
			new BufferedProcess({
				command: 'adb',
				args: [ 'shell', 'pidof', this.applicationId ],
				stdout: output => {
					console.log(output);
					resolve(output);
				},
				stderr: output => console.error(output),
				exit: code => {
					if (code === 0) {
						resolve();
					} else {
						reject('get pid failed');
					}
				}
			});
		});
	}

	attachToLogCat(deviceId, pid) {
		console.log('deviceId: ' + deviceId);
		console.log('pid: ' + pid);
		this.logCat = new BufferedProcess({
			command: 'adb',
			args: [ '-s', deviceId, 'logcat', '-v', 'brief', '-b', 'main', '--pid', pid ],
			stdout: output => this.writeLine(output),
			stderr: output => this.writeLine(output), //TODO write as error
			exit: code => {
				if (code === 0) {
					resolve();
				} else {
					reject('attach to logcat failed');
				}
			}
		});
	}

	writeLine(line) {
		line = this.swapLevelIndicator(line);
		atom.commands.dispatch(atom.views.getView(atom.workspace), 'appc:console:write-line', {
			line: line
		});
	}

	swapLevelIndicator (line) {
		// TODO probably need to split lines here first - but probably worth moving this check into console
		if (line.charAt(1) === '/') {
			switch (line.charAt(0)) {
				case 'T':
					line = line.replace(/^T\//, '[TRACE]');
					break;
				case 'I':
					line = line.replace(/^I\//, '[INFO]');
					break;
				case 'D':
					line = line.replace(/^D\//, '[DEBUG]');
					break;
				case 'W':
					line = line.replace(/^W\//, '[WARN]');
					break;
				case 'E':
					line = line.replace(/^E\//, '[ERROR]');
					break;
			}
		}
		return line;
	}

	stop() {
		this.stopLogging();
	}

	stopLogging() {
		if (this.logCat) {
			try {
				this.logCat.kill();
			} catch (ex) {
				console.error('failed to kill logcat process:' + ex);
			}
		}
	}

}