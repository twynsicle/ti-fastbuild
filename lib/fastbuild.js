'use babel';

import { BufferedProcess } from 'atom';

const Promise = require('bluebird');

const fs = require('fs');

const timeout = ms => new Promise(res => setTimeout(res, ms));

export default class FastBuild {

	constructor(console) {
		this.console = console;
		this.loadProjectProperties();
	}

	loadProjectProperties() {
		let projectDirectory = atom.project.getPaths()[0];
		let tiapp = projectDirectory + '\\tiapp.xml';
		fs.readFile(tiapp, (error, data) => {
			if (error) {
				this.writeError('error reading tiapp.xml');
				return;
			}
			let contents = data.toString();
			this.sdkVersion = contents.match(/<sdk-version>([-A-Za-z0-9.]*)<\/sdk-version>/)[1];
			this.applicationName = contents.match(/<name>(\w*)<\/name>/)[1];
			this.applicationId = contents.match(/<id>([.\w]*)<\/id>/)[1];
		});
	}

	async build(deviceId) {
		this.console.writeSystem('Starting build...');
		let start = Date.now();

		try {
			this.initFileNames();
			await this.zipAlign();
			await this.sign();
			this.console.writeSystem(`Build completed in ${((Date.now() - start) / 1000)}s`);
			this.console.writeSystem('Installing apk...');
			start = Date.now();
			await this.adbInstall(deviceId);
			this.console.writeSystem(`Apk installed in ${((Date.now() - start) / 1000)}s`);
			this.console.writeSystem('Starting app...');
			await this.startApp(deviceId);
			await timeout(1000);
			let pid = await this.getPid(deviceId);
			await this.attachToLogCat(deviceId, pid);
		} catch (error) {
			this.writeError(error);
		}
	}

	initFileNames() {
		let projectDirectory = atom.project.getPaths()[0],
			debugFile = projectDirectory + '\\build\\android\\bin\\' + this.applicationName + '-dev-debug.apk',
			productionFile = projectDirectory + '\\build\\android\\bin\\' + this.applicationName + '.apk';
		if (fs.existsSync(debugFile)) {
			if (fs.existsSync(productionFile)) {
				this.console.writeSystem(`warning, both ${this.applicationName + '-dev-debug.apk'} and ${this.applicationName + '.apk'} exist`);
				this.console.writeSystem(`deploying ${this.applicationName + '-dev-debug.apk'} to device`);
			}
			this.unsignedZip = projectDirectory + '\\build\\android\\bin\\app-unsigned-dev-debug.apk';
			this.alignedZip = projectDirectory + '\\build\\android\\bin\\app-unsigned-dev-debug.apkz';
			this.apkFile = debugFile;
		} else if (fs.existsSync(productionFile)) {
			this.unsignedZip = projectDirectory + '\\build\\android\\bin\\app-unsigned.apk';
			this.alignedZip = projectDirectory + '\\build\\android\\bin\\app-unsigned.apkz';
			this.apkFile = productionFile;
		} else {
			let message = 'Build directory is empty, fastbuild requires an existing file to build upon.';
			atom.notifications.addError('Build Failed', {
				detail: message,
				dismissable: true
			});
			throw new Error(message);
		}
	}

	zipAlign() {
		return new Promise((resolve, reject) => {
			new BufferedProcess({
				command: 'zipalign',
				args: [ '-f', '4', this.unsignedZip, this.alignedZip ],
				stdout: output => this.console.writeSystem(output),
				stderr: output => this.writeError(output),
				exit: code => this.processExit(code, resolve, reject, 'failed to align zip')
			});
		});
	}

	sign() {
		return new Promise((resolve, reject) => {
			// TODO probably should sanity check that this file exists
			let keystore = 'C:\\ProgramData\\Titanium\\mobilesdk\\win32\\' + this.sdkVersion + '\\android\\dev_keystore';
			let keystoreStorePassword = 'pass:tirocks';
			new BufferedProcess({
				command: 'apksigner.bat',
				args: [ 'sign', '--ks', keystore, '--ks-pass', keystoreStorePassword, '--out', this.apkFile, this.alignedZip ],
				stdout: output => this.console.writeSystem(output),
				stderr: output => this.writeError(output),
				exit: code => this.processExit(code, resolve, reject, 'failed to to sign app')
			});
		});
	}

	adbInstall(deviceId) {
		return new Promise((resolve, reject) => {
			new BufferedProcess({
				command: 'adb',
				args: [ '-s', deviceId, 'install', '-r', this.apkFile ],
				stdout: output => this.console.writeSystem(output),
				stderr: output => this.writeError(output),
				exit: code => this.processExit(code, resolve, reject, 'failed to install apk')
			});
		});
	}

	startApp(deviceId) {
		return new Promise((resolve, reject) => {
			new BufferedProcess({
				command: 'adb',
				args: [ '-s', deviceId, 'shell', 'am', 'start', '-n', (this.applicationId + '/.' + this.getActivityName()) ],
				stdout: output => this.console.writeSystem(output),
				stderr: output => this.writeError(output),
				exit: code => this.processExit(code, resolve, reject, 'failed to start app')
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

	getPid(deviceId) {
		return new Promise((resolve, reject) => {
			new BufferedProcess({
				command: 'adb',
				args: [ '-s', deviceId, 'shell', ' ps', '|', 'grep', this.applicationId ],
				stdout: output => {
					let matches = output.match(/ (\d+) /);
					if (!matches || !matches.length) {
						reject('could not identify pid');
					}
					let pid = matches[1];
					resolve(pid);
				},
				stderr: output => this.writeError(output),
				exit: code => this.processExit(code, resolve, reject, 'failed to get pid')
			});
		});
	}

	attachToLogCat(deviceId, pid) {
		return new Promise((resolve, reject) => {
			this.logCat = new BufferedProcess({
				command: 'adb',
				args: [ '-s', deviceId, 'logcat', '-v', 'brief', '-b', 'main', '--pid', pid ],
				stdout: output => this.writeLines(output),
				stderr: output => this.writeError(output),
				exit: code => this.processExit(code, resolve, reject, 'failed to attached to logcat')
			});
		});
	}

	processExit(code, resolve, reject, message) {
		if (code === 0) {
			resolve();
		} else {
			this.writeError(message);
			reject(message);
		}
	}

	writeError(error) {
		this.console.writeSystem('[ERROR] ' + error);
	}

	writeLines(lines) {
		lines.split('\n').forEach((line) => {
			line = this.swapLevelIndicator(line);
			this.console.write(line);
		});
	}

	swapLevelIndicator (line) {
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
				this.writeError('failed to kill logcat process:' + ex);
			}
		}
	}
}
