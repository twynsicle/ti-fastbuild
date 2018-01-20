/** @babel */
/** @jsx etch.dom */

import { CompositeDisposable } from 'atom';
import { platform } from 'os';
import etch from 'etch';

import Button from './button';
import ConsoleConfig from './console/consoleconfig';
import ConsoleLog from './console/consolelog';

const logLevels = [ 'TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR' ];

const defaultOpts = {
	isHidden: true,
	logLevel: 'trace',
	autoScroll: true,
	showOnBuild: true,
	openDebugTools: true,
	linewrap: false,
	clearBuildLogs: false,
	filter: ''
};

export default class Console {

	constructor(opts, browser) {
		this.state = defaultOpts;
		opts && Object.assign(this.state, opts);

		etch.initialize(this);

		this.browser = browser;

		if (!this.state.isHidden) {
			this.show();
		}

		const bottomDock = atom.workspace.getBottomDock();
		const rightDock = atom.workspace.getRightDock();
		this.subscriptions = new CompositeDisposable();
		this.subscriptions.add(
			bottomDock.onDidChangeVisible((visible) => {
				for (const item of bottomDock.getPaneItems()) {
					if (item === this) {
						this.state.isHidden = !visible;
					}
				}
			}),
			rightDock.onDidChangeVisible((visible) => {
				for (const item of rightDock.getPaneItems()) {
					if (item === this) {
						this.state.isHidden = !visible;
					}
				}
			}),
			atom.workspace.onDidAddPaneItem((e) => {
				if (e.item === this) {
					this.state.isHidden = false;
				}
			}),
			atom.workspace.onDidDestroyPaneItem((e) => {
				if (e.item === this) {
					this.state.isHidden = true;
				}
			})
		);
	}

	async destroy() {
		this.subscriptions.dispose();
		await etch.destroy(this);
	}

	render() {
		return <div className="appc-console">
			<div className="appc-toolbar">
				<div class="toolbar-row">
					<div className="toolbar-left">
						<input flat="true" type="test" className="toolbar-left input-text native-key-bindings" placeholder="filter"
							name="filter" value={this.state.filter}
							on={{ keyup: this.filterDidChange, paste: this.filterDidChange }}/>
					</div>
					<div className="toolbar-right main-toolbar-group">
						<Button flat="true" icon="jump-down" click={this.clickAutoScroll.bind(this)}
							className={this.state.autoScroll ? 'button-right btn selected' : 'button-right btn'}/>
						<Button flat="true" icon="trashcan" className="button-right"
							click={this.clear.bind(this)}/>
						<Button flat="true" icon="gear" className="button-right"
							click={this.showConfig.bind(this)}/>
					</div>
				</div>
			</div>
			<ConsoleLog ref="log" autoScroll={this.state.autoScroll} linewrap={this.state.linewrap} filter={this.state.filter} />
		</div>;
	}

	update() {
		return etch.update(this);
	}

	getTitle() {
		return 'Appcelerator Console';
	}

	getURI() {
		return 'atom://appcelerator-titanium/console';
	}

	getDefaultLocation() {
		return 'bottom';
	}

	getAllowedLocations() {
		return [ 'right', 'bottom' ];
	}

	serializedState() {
		return this.state;
	}

	write(text) {
		text = text.replace(/(?:\r\n|\r|\n)/g, '<br />');
		if (platform() === 'win32') {
			text = text.replace(/\u0008/g, '');
		}
		const lines = text.split('<br />');

		for (let line of lines) {
			line = line.replace(/^\[(\w+)] :/, '[$1]');
			if (line.length === 0) {
				continue;
			}

			this.writeLine(line);
			if (this.state.openDebugTools) {
				this.openDevtools(line);
			}
			if (this.state.clearBuildLogs) {
				this.clearBuildLogs(line);
			}
		}
	}

	writeLine(line) {
		let shown;
		for (let level of logLevels) {
			if (this.lineIsLevel(level, line)) {
				this.refs.log.write(line, level.toLowerCase());
				shown = true;
				break;
			}
		}
		if (!shown) {
			this.refs.log.write(line, 'info');
		}
	}

	lineIsLevel(level, line) {
		return line.startsWith('[' + level) || line.indexOf(level) !== -1;
	}

	openDevtools(line) {
		let matchResult = line.match(/(chrome-devtools.*)$/);
		if (matchResult) {
			let url = matchResult[0];
			this.browser.setUrl(url);
			this.browser.show();
		}
	}

	clearBuildLogs(line) {
		if (line.startsWith('-- Start application log')) {
			this.clear();
		}
	}

	toggle() {
		this.state.isHidden = this.hide();
		if (!this.state.isHidden) {
			this.show();
		}
	}

	show(buildInProgress) {
		if (buildInProgress && !this.state.showOnBuild) {
			return;
		}
		atom.workspace.open(this);
	}

	hide() {
		return atom.workspace.hide(this);
	}

	getLogLevel() {
		return this.state.logLevel;
	}

	filterDidChange(event) {
		let filter = event.target.value;
		this.state.filter = filter;
		this.refs.log.updateFilter(filter);
	}

	clickAutoScroll() {
		this.state.autoScroll = !this.state.autoScroll;
		this.update();
	}

	clear() {
		this.refs.log.clear();
	}

	showConfig() {
		let config;
		this.config = new ConsoleConfig({
			close: () => {
				config.destroy();
			},
			state: this.state,
			updateConsole: () => {
				this.update();
			}
		});
		config = atom.workspace.addModalPanel({ item: this.config });
	}
}
