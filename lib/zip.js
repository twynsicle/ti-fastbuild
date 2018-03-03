'use babel';
/* eslint-disable no-undef */

const fs = require('fs');
const Promise = require('bluebird');
const JSZip = require('jszip');

export default class Zip {

	constructor(path, console) {
		this.path = path;
		this.console = console;
	}

	async load() {
		try {
			let data = await this.readFile();
			this.zip = await JSZip.loadAsync(data);
			// this.console.writeSystem(`zip opened ${this.path}`);
			return true;
		} catch (error) {
			this.console.writeSystem('error:' + error);
			return false;
		}
	}

	readFile() {
		return new Promise((resolve, reject) => {
			fs.readFile(this.path, (error, result) => {
				if (error) {
					reject(error);
				} else {
					resolve(result);
				}
			});
		});
	}

	writeFile(from, to) {
		let opts = {
			compression: 'DEFLATE',
			compressionOptions: {
				level: 5
			}
		};
		let rs = fs.createReadStream(from);
		this.zip.file(to, rs, opts);
	}

	save() {
		let opts = {
			type: 'nodebuffer',
			streamFiles: true,
			compression: 'DEFLATE',
			compressionOptions: {
				level: 5
			}
		};
		return new Promise((resolve) => {
			this.zip.generateNodeStream(opts)
				.pipe(fs.createWriteStream(this.path))
				.on('finish', () => {
					// this.console.writeSystem(`zip saved ${this.path}`);
					resolve();
				});
		});
	}
}
