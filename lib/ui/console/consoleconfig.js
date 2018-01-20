/** @babel */
/** @jsx etch.dom */

import etch from 'etch';

import Select from '../select';

export default class ConsoleConfig {

	constructor(opts) {
		this.opts = opts;
		this.state = opts.state || {};
		this.type = 'controller';
		this.focus = 'name';
		etch.initialize(this);
		this.setFocus();
	}

	async destroy() {
		await etch.destroy(this);
	}

	render() {
		return <div className="console-messages native-key-bindings appc-config" ref="log" attributes={{ tabindex:'-1' }}>
			<div className="row">
				<Select change={this.logLevelValueDidChange.bind(this)} value={this.state.logLevel}>
					<option value="trace">Trace</option>
					<option value="debug">Debug</option>
					<option value="info">Info</option>
					<option value="warn">Warn</option>
					<option value="error">Error</option>
				</Select>
			</div>
			<div className="row">
				<div className="toolbar-item-title">
					<input id="auto-scroll" className="input-checkbox" type="checkbox" attributes={this.state.autoScroll ? { checked: 'true' } : {}}
						   on={{ change: this.autoScrollCheckboxDidChange }}/>
					<label for="auto-sScroll" className="input-label">Auto-scroll</label>
				</div>
			</div>
			<div className="row">
				<div className="toolbar-item-title">
					<input id="on-build" className="input-checkbox" type="checkbox" attributes={this.state.showOnBuild ? { checked: 'true' } : {}}
						   on={{ change: this.showOnBuildCheckboxDidChange }}/>
					<label for="on-build" className="input-label">Show on build</label>
				</div>
			</div>
			<div className="row">
				<div className="toolbar-item-title">
					<input id="open-debug" className="input-checkbox" type="checkbox" attributes={this.state.openDebugTools ? { checked: 'true' } : {}}
						   on={{ change: this.openDebugToolsCheckboxDidChange }}/>
					<label for="open-debug" className="input-label">Automatically open dev tools</label>
				</div>
			</div>

			<div className="row-buttons">
				<button className="btn" on={{ click: this.closeButtonClicked }}>Close</button>
			</div>
		</div>;
	}

	update() {
		return etch.update(this);
	}

	setFocus() {
		/* setTimeout(() => {
			if (this.focus) {
				this.refs[this.focus].focus();
				this.focus = null;
			}
		}, 0);*/
	}

	readAfterUpdate() {
	}

	write(text, level) {
	}

	clear() {
	}

	logLevelValueDidChange(event) {
		this.state.logLevel = event.target.selectedOptions[0].value;
	}

	autoScrollCheckboxDidChange(event) {
		this.state.autoScroll = event.target.checked;
		etch.update(this);
	}

	showOnBuildCheckboxDidChange(event) {
		this.state.showOnBuild = event.target.checked;
		etch.update(this);
	}

	openDebugToolsCheckboxDidChange(event) {
		this.state.openDebugTools = event.target.checked;
		etch.update(this); // TODO
	}

	closeButtonClicked(event) {
		this.opts.close && this.opts.close();
	}
}
