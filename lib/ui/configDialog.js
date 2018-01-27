/** @babel */
/** @jsx etch.dom */

/* eslint-disable no-mixed-spaces-and-tabs */

import etch from 'etch';
const rimraf = require('rimraf');

import { SETTINGS } from '../settings';

export default class ConfigDialog {

	constructor(settings) {
		this.settings = settings;
		this.settings.addListener((key) => {
			this.update();
			if (typeof this.settings.get(key) === 'boolean') {
				// eslint-disable-next-line no-undef
				document.querySelector(`.appc-config [data-setting=${key}]`).checked = this.settings.get(key);
			}
		});
		this.loading = false;
		etch.initialize(this);
	}

	async destroy() {
		await etch.destroy(this);
	}

	render() {
		return <div className="config-dialog native-key-bindings appc-config" ref="log"
			attributes={{ tabindex: '-1' }}>
			<div className="row heading">
				<h2>Build/Debug</h2>
			</div>
			<div className="row">
				<div className="toolbar-item-title">
					<label htmlFor="on-build" className="input-label">Build command</label>
					<input id="on-build" className="input-text" type="text"
						   value={this.settings.get(SETTINGS.BUILD.BUILD_COMMAND)}
						   on={{ change: (event) => this.updateSetting(SETTINGS.BUILD.BUILD_COMMAND, event.target.value) }}/>
				</div>
			</div>
			{ this.buildCheckboxSetting('randomize-port-number', SETTINGS.BUILD.RANDOMIZE_PORT_NUMBER, 'Randomize port number') }
			<div className="row">
				<div className="toolbar-item-title">
					<label htmlFor="on-build" className="input-label">Debug port number</label>
					<input id="on-build" className="input-text" type="text"
						value={this.settings.get(SETTINGS.BUILD.DEBUG_PORT)}
						on={{ change: (event) => this.updateSetting(SETTINGS.BUILD.DEBUG_PORT, event.target.value) }}/>
				</div>
			</div>
			<div className="row clean-build-row">
				<button className="btn clean-build" on={{ click: this.cleanBuildFolderClicked }} >Clean build folder</button>
			</div>
			<div className="row heading">
				<h2>Debugger</h2>
			</div>
			{ this.buildCheckboxSetting('open-debug', SETTINGS.DEBUGGER.OPEN_DEBUG_TOOLS, 'Automatically open devtools') }
			{ this.buildCheckboxSetting('skip-first-breakpoint', SETTINGS.DEBUGGER.SKIP_FIRST_BREAKPOINT, 'Skip first breakpoint') }
			<div className="row heading">
				<h2>Console</h2>
			</div>
			{ this.buildCheckboxSetting('on-build', SETTINGS.CONSOLE.SHOW_ON_BUILD, 'Show console on build') }
			{ this.buildCheckboxSetting('linewrap', SETTINGS.CONSOLE.LINE_WRAP, 'Linewrap') }
			{ this.buildCheckboxSetting('clear-build-logs', SETTINGS.CONSOLE.CLEAR_BUILD_LOGS, 'Clear logs after successful build') }

			<div className={this.loading ? 'row' : 'row mask'}>
				<progress className="inline-block" />
			</div>
			<div className="row-buttons">
				<button className="btn" on={{ click: this.restoreDefaultsButtonClicked }}>Restore Defaults</button>
				<button className="btn btn-primary" on={{ click: this.closeButtonClicked }}>Close</button>
			</div>
		</div>;
	}

	buildCheckboxSetting(id, key, label) {
		let attributes = {
			'data-setting': key
		};
		if (this.settings.get(key)) {
			attributes.checked = 'checked';
		}
		return <div className="row">
			<div className="toolbar-item-title">
				<label htmlFor={ id } className="input-label">{ label }</label>
				<input id={ id } className="input-checkbox" type="checkbox"
					   attributes={ attributes }
					   on={{ change: (event) => this.updateSetting(key, event.target.checked) }}/>
			</div>
		</div>;
	}

	isChecked(setting) {
		return this.settings.get(setting) ? { checked: 'checked' } : {};
	}

	updateSetting(key, value) {
		this.settings.set(key, value);
	}

	update() {
		return etch.update(this);
	}

	setCloseAction(closeFn) {
		this.close = closeFn;
	}

	cleanBuildFolderClicked() {
		let buildDirectory = atom.project.getPaths()[0] + '\\build';
		this.loading = true;
		this.update();
		rimraf(buildDirectory, [], () => {
			this.loading = false;
			this.update();
		});
	}

	restoreDefaultsButtonClicked() {
		this.settings.restoreDefaults();
	}

	closeButtonClicked() {
		this.close && this.close();
	}
}
