'use babel';
/* eslint-disable no-undef */

import * as chokidar from 'chokidar';
import * as path from 'path';

const fs = require('fs');
const Promise = require('bluebird');
const Zip = require('jszip');

export default class Watcher {

	constructor() {
		this.projectDirectory = atom.project.getPaths()[0];
		this.resourcesDirectory = this.projectDirectory + '\\Resources\\';
	}

	init() {
		this.watcher = chokidar.watch(this.resourcesDirectory, {
			ignored: /node_modules/,
			persistent: true
		});

		this.watcher.on('change', path => this.copyFile(path));
		console.log('watching: ' + this.resourcesDirectory);
	}

	copyFile(from) {
		this.initFileNames();
		const start = Date.now();
		if (path.extname(from) !== '.js') {
			return;
		}

		let to = from.replace(this.projectDirectory, 'assets').replace(/\\/g, '/');

		console.log(`copying from ${from} to ${this.unsignedZip} -> ${to}`);

		return this.loadZip(this.unsignedZip)
			.tap((zip) => {
				return this.writeFileToZip(zip, from, to);
			})
			.then((zip) => {
				return this.saveZip(zip);
			})
			.tap(() => {
				console.log(`copied into zip time: ${((Date.now() - start) / 1000)}s`);
			});
	}

	initFileNames() {
		let projectDirectory = atom.project.getPaths()[0];
		if (fs.existsSync(projectDirectory + '\\build\\android\\bin\\app-unsigned-dev-debug.apk')) {
			this.unsignedZip = projectDirectory + '\\build\\android\\bin\\app-unsigned-dev-debug.apk';
		} else {
			this.unsignedZip = projectDirectory + '\\build\\android\\bin\\app-unsigned.apk';
		}
	}

	loadZip(path) {
		return new Promise((resolve, reject) => {
			fs.readFile(path, (error, result) => {
				if (error) {
					reject(error);
				} else {
					resolve(result);
				}
			});
		})
			.then((data) => {
				return Zip.loadAsync(data);
			});
	}

	writeFileToZip(zip, from, to) {
		console.log('writing file to zip...');
		let opts = {
			compression: 'DEFLATE',
			compressionOptions: {
				level: 5
			}
		};
		let rs = fs.createReadStream(from);
		zip.file(to, rs, opts);
	}

	saveZip(zip) {
		let opts = {
			type: 'nodebuffer',
			streamFiles: true,
			compression: 'DEFLATE',
			compressionOptions: {
				level: 5
			}
		};
		return new Promise((resolve) => {
			zip.generateNodeStream(opts)
				.pipe(fs.createWriteStream(this.unsignedZip))
				.on('finish', () => {
					resolve();
				});
		});
	}
}
