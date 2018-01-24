/** @babel */

const { EventEmitter } = require('fbemitter');

const defaultSettings = {
	// build
	debugPortNumber: 55283,
	// debugger
	openDebugTools: true,
	skipFirstBreakPoint: true,
	// console
	showOnBuild: true,
	linewrap: false,
	clearBuildLogs: true,
};

export const SETTINGS = {
	BUILD: {
		DEBUG_PORT: 'debugPortNumber'
	},
	DEBUGGER: {
		OPEN_DEBUG_TOOLS: 'openDebugTools',
		SKIP_FIRST_BREAKPOINT: 'skipFirstBreakPoint'
	},
	CONSOLE: {
		SHOW_ON_BUILD: 'showOnBuild',
		LINE_WRAP: 'linewrap',
		CLEAR_BUILD_LOGS: 'clearBuildLogs'
	}
};

export default class Settings {

	constructor (state) {
		this.eventEmitter = new EventEmitter();
		this.settings = state;
		if (!this.settings) {
			this.settings = defaultSettings;
		}
	}

	addListener(callback) {
		this.eventEmitter.addListener('changed', callback);
	}

	set(key, value) {
		this.settings[key] = value;
		this.eventEmitter.emit('changed', key);
	}

	get(key) {
		return this.settings[key];
	}

	getSettings() {
		return this.settings;
	}

	restoreDefaults() {
		for (let [key, value] of Object.entries(defaultSettings)) {
			this.set(key, value);
		}
	}
}
