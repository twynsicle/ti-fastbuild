'use babel';
/* eslint-disable no-undef */

import * as chokidar from 'chokidar';
import * as path from 'path';

import Zip from './zip';

const fs = require('fs');

export default class Watcher {

	constructor(console) {
		this.console = console;

		this.queue = [];
		this.projectDirectory = atom.project.getPaths()[0];
		this.resourcesDirectory = this.projectDirectory + '\\Resources\\';
		this.zipPath = this.projectDirectory + '\\build\\android\\bin\\app-unsigned.apk';
		this.debugZipPath = this.projectDirectory + '\\build\\android\\bin\\app-unsigned-dev-debug.apk';
	}

	init() {
		this.watcher = chokidar.watch(this.resourcesDirectory, {
			ignored: /node_modules/,
			persistent: true
		});

		this.watcher.on('change', path => this.onFileChange(path));
		this.console.writeSystem('watching: ' + this.resourcesDirectory);
	}

	disable() {
		this.watcher.close();
		this.console.writeSystem('disabling watcher');
	}

	async onFileChange(filePath) {
		if (path.extname(filePath) !== '.js') {
			return;
		}
		this.queue.push(filePath);
		if (!this.processingQueue) {
			return this.processQueue();
		}
	}

	async processQueue() {
		this.processingQueue = true;
		if (!this.queue.length) {
			this.processingQueue = false;
			return;
		}

		let targets = await this.loadTargets();

		if (!targets.length) {
			this.console.writeSystem('cannot copy as no destination apks exist');
			this.processingQueue = false;
			return;
		}

		while (this.queue.length) {
			let filePath = this.queue.pop();
			for (let target of targets) {
				await this.copyFile(target, filePath);
			}
		}

		for (let target of targets) {
			await target.save();
		}

		this.processingQueue = false;

		if (this.queue.length) {
			return this.processQueue();
		} else {
			this.console.writeSystem('copy to zip completed');
			this.writeDirtyFile();
		}
	}

	async loadTargets() {
		let targets = [];
		if (fs.existsSync(this.debugZipPath)) {
			let debugZip = new Zip(this.debugZipPath, this.console);
			if (await debugZip.load()) {
				targets.push(debugZip);
			}
		}
		if (fs.existsSync(this.zipPath)) {
			let zip = new Zip(this.zipPath, this.console);
			if (await zip.load()) {
				targets.push(zip);
			}
		}
		return targets;
	}

	async copyFile(zip, from) {
		let to = from.replace(this.projectDirectory, 'assets').replace(/\\/g, '/');

		this.console.writeSystem(`copying from ${from} to ${zip.path} -> ${to}`);
		await zip.writeFile(from, to);
	}

	writeDirtyFile() {
		let dirtyFile = this.projectDirectory + '\\build\\android\\bin\\.dirty';
		fs.closeSync(fs.openSync(dirtyFile, 'w'));
	}
}
