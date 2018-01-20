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
		return <div className="console-messages native-key-bindings appc-config" ref="log"
			attributes={{ tabindex: '-1' }}>
			<div className="row">
				<label>Minimum log level</label>
				<Select change={this.logLevelValueDidChange.bind(this)}
					value={this.state.logLevel}>
					<option value="trace">Trace</option>
					<option value="debug">Debug</option>
					<option value="info">Info</option>
					<option value="warn">Warn</option>
					<option value="error">Error</option>
				</Select>
			</div>
			<div className="row">
				<div className="toolbar-item-title">
					<label htmlFor="auto-scroll" className="input-label">Auto-scroll</label>
					<input id="auto-scroll" className="input-checkbox" type="checkbox"
						   attributes={this.state.autoScroll ? { checked: 'true' } : {}}
						   on={{ change: this.autoScrollCheckboxDidChange }}/>
				</div>
			</div>
			<div className="row">
				<div className="toolbar-item-title">
					<label htmlFor="on-build" className="input-label">Show on build</label>
					<input id="on-build" className="input-checkbox" type="checkbox"
						   attributes={this.state.showOnBuild ? { checked: 'true' } : {}}
						   on={{ change: this.showOnBuildCheckboxDidChange }}/>
				</div>
			</div>
			<div className="row">
				<div className="toolbar-item-title">
					<label htmlFor="open-debug" className="input-label">Automatically open
						devtools</label>
					<input id="open-debug" className="input-checkbox" type="checkbox"
						   attributes={this.state.openDebugTools ? { checked: 'true' } : {}}
						   on={{ change: this.openDebugToolsCheckboxDidChange }}/>
				</div>
			</div>
			<div className="row">
				<div className="toolbar-item-title">
					<label htmlFor="linewrap" className="input-label">Linewrap</label>
					<input id="linewrap" className="input-checkbox" type="checkbox"
						   attributes={this.state.linewrap ? { checked: 'true' } : {}}
						   on={{ change: this.linewrapCheckboxDidChange }}/>
				</div>
			</div>
			<div className="row">
				<div className="toolbar-item-title">
					<label htmlFor="clear-build-logs" className="input-label">Clear logs after successful build</label>
					<input id="clear-build-logs" className="input-checkbox" type="checkbox"
						   attributes={this.state.clearBuildLogs ? { checked: 'true' } : {}}
						   on={{ change: this.clearBuildLogsCheckboxDidChange }}/>
				</div>
			</div>

			<div className="row-buttons">
				<button className="btn" on={{ click: this.closeButtonClicked }}>Close</button>
			</div>
		</div>;
	}

	update() {
		this.opts.updateConsole();
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
		this.update();
	}

	showOnBuildCheckboxDidChange(event) {
		this.state.showOnBuild = event.target.checked;
		this.update();
	}

	openDebugToolsCheckboxDidChange(event) {
		this.state.openDebugTools = event.target.checked;
		this.update();
	}

	linewrapCheckboxDidChange(event) {
		this.state.linewrap = event.target.checked;
		this.update();
	}

	clearBuildLogsCheckboxDidChange(event) {
		this.state.clearBuildLogs = event.target.checked;
		this.update();
	}

	closeButtonClicked(event) {
		this.opts.close && this.opts.close();
	}
}
