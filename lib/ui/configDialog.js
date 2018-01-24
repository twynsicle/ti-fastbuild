/** @babel */
/** @jsx etch.dom */

/* eslint-disable no-mixed-spaces-and-tabs */

import etch from 'etch';
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
					<label htmlFor="on-build" className="input-label">Debug port number</label>
					<input id="on-build" className="input-text" type="text"
						value={this.settings.get(SETTINGS.BUILD.DEBUG_PORT)}
						on={{ change: (event) => this.updateCheckbox(SETTINGS.BUILD.DEBUG_PORT, event.target.value) }}/>
				</div>
			</div>
			<div className="row heading">
				<h2>Debugger</h2>
			</div>
			{ this.buildCheckboxSetting('open debug', SETTINGS.DEBUGGER.OPEN_DEBUG_TOOLS, 'Automatically open devtools') }
			{ this.buildCheckboxSetting('skip-first-breakpoint', SETTINGS.DEBUGGER.SKIP_FIRST_BREAKPOINT, 'Skip first breakpoint') }
			<div className="row heading">
				<h2>Console</h2>
			</div>
			{ this.buildCheckboxSetting('on-build', SETTINGS.CONSOLE.SHOW_ON_BUILD, 'Show console on build') }
			{ this.buildCheckboxSetting('linewrap', SETTINGS.CONSOLE.LINE_WRAP, 'Linewrap') }
			{ this.buildCheckboxSetting('clear-build-logs', SETTINGS.CONSOLE.CLEAR_BUILD_LOGS, 'Clear logs after successful build') }

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
					   on={{ change: (event) => this.updateCheckbox(key, event.target.checked) }}/>
			</div>
		</div>;
	}

	isChecked(setting) {
		let result = this.settings.get(setting) ? { checked: 'checked', data: Math.random() } : { data: Math.random() };
		return result;
	}

	updateCheckbox(key, value) {
		this.settings.set(key, value);
	}

	update() {
		return etch.update(this);
	}

	setCloseAction(closeFn) {
		this.close = closeFn;
	}

	restoreDefaultsButtonClicked() {
		this.settings.restoreDefaults();
	}

	closeButtonClicked() {
		this.close && this.close();
	}
}
