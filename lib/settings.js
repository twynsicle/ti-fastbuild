/** @babel */

const { EventEmitter } = require('fbemitter');

const defaultSettings = {
	// build
	buildCommand: 'ti build',
	debugPortNumber: 55283,
	randomisePortNumber: true,
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
		BUILD_COMMAND: 'buildCommand',
		DEBUG_PORT: 'debugPortNumber',
		RANDOMIZE_PORT_NUMBER: 'randomisePortNumber'
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
		this.loadSettings(defaultSettings, state);
	}

	// Builds settings object fresh so we drop old settings and properly incorporate new settings.
	loadSettings(defaultSettings, state) {
		this.settings = Object.assign({}, defaultSettings);
		if (!state) {
			return false;
		}
		for (let [ key, value ] of Object.entries(state)) {
			if (typeof this.settings[key] !== 'undefined') {
				this.settings[key] = value;
			}
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
		for (let [ key, value ] of Object.entries(defaultSettings)) {
			this.set(key, value);
		}
	}
}
