/** @babel */

const { EventEmitter } = require('fbemitter');
const fs = require('fs');

export default class DirtyState {

	constructor () {
		this.eventEmitter = new EventEmitter();
		this.dirtyFile = atom.project.getPaths()[0] + '\\build\\android\\bin\\.dirty';
	}

	init() {
		this.dirty = fs.existsSync(this.dirtyFile);
	}

	isDirty() {
		return this.dirty;
	}

	setDirty() {
		fs.closeSync(fs.openSync(this.dirtyFile, 'w'));
		this.dirty = true;
		this.eventEmitter.emit('changed', true);
	}

	setNotDirty() {
		if (fs.existsSync(this.dirtyFile)) {
			fs.unlinkSync(this.dirtyFile);
		}
		this.dirty = false;
		this.eventEmitter.emit('changed', false);
	}

	addListener(callback) {
		this.eventEmitter.addListener('changed', callback);
	}
}
