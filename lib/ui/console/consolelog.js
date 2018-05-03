/** @babel */
/** @jsx etch.dom */

import etch from 'etch';
import format from 'date-fns/format';

import { SETTINGS } from '../../settings';

export default class ConsoleLog {

	constructor(opts) {
		this.children = [];
		this.filteredChildren = [];
		this.updateOpts(opts);

		atom.contextMenu.add({
			'.console-messages': [
				{ label: 'Copy', command: 'core:copy' },
				{ label: 'Clear', command: 'appc:clear-console' }
			]
		});
		etch.initialize(this);
	}

	async destroy() {
		await etch.destroy(this);
	}

	render() {
		let classes = 'console-messages native-key-bindings ';
		if (this.settings.get(SETTINGS.CONSOLE.LINE_WRAP)) {
			classes += 'linewrap ';
		}
		if (this.settings.get(SETTINGS.CONSOLE.HIDE_WEBVIEW_MESSAGES)) {
			classes += 'hide-webview-messages ';
		}
		if (this.settings.get(SETTINGS.CONSOLE.HIDE_TIMESTAMPS)) {
			classes += 'hide-timestamps ';
		}
		return (
			<ul className={classes} ref="log" attributes={{ tabindex: '-1', 'data-min-level': this.level }}>
				{this.filteredChildren}
			</ul>
		);
	}

	update(opts) {
		if (opts) {
			this.updateOpts(opts);
		}
		return etch.update(this);
	}

	updateOpts(opts) {
		this.settings = opts.settings;
		this.autoScroll = opts.autoScroll;
		this.filter = opts.filter;
		this.filterRegExp = RegExp(opts.filter, 'i');
		this.level = opts.level;
	}

	readAfterUpdate() {
		if (this.autoScroll) {
			this.refs.log.scrollTop = this.refs.log.scrollHeight;
		}
	}

	updateFilter(filter) {
		if (filter === this.filter) {
			return;
		}
		this.filter = filter;
		this.filteredChildren = [];

		try {
			this.filterRegExp = RegExp(filter, 'i');
		} catch (ex) {
			this.filterRegExp = undefined;
			this.update();
			return;
		}

		for (let line of this.children) {
			this.addLineIfMatchesFilter(line);
		}
		this.update();
	}

	write(text, level) {
		let line = {
			level: level,
			text: text,
			timestamp: format(Date.now(), 'hh:mm:ss.SSS'),
		};
		this.children.push(line);
		this.addLineIfMatchesFilter(line);
		this.update();
	}

	addLineIfMatchesFilter(line) {
		if (this.matchesFilter(line.text)) {
			let className = `log ${line.level}`;
			if (line.text.indexOf('chromium') > -1) {
				className += ' webview';
			}
			this.filteredChildren.push(<li className={className}><span className="timestamp">{line.timestamp}</span><span className="text">{line.text}</span></li>);
		}
	}

	matchesFilter(text) {
		if (!this.filter) {
			return true;
		}
		if (!this.filterRegExp) {
			return false;
		}
		return this.filterRegExp.test(text);
	}

	clear() {
		this.children = [];
		this.filteredChildren = [];
		this.update();
	}
}
