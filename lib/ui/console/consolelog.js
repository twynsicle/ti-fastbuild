/** @babel */
/** @jsx etch.dom */

import etch from 'etch';

export default class ConsoleLog {

	constructor(opts) {
		this.children = [];
		this.filteredChildren = [];
		this.updateOpts(opts);
		etch.initialize(this);
	}

	async destroy() {
		await etch.destroy(this);
	}

	render() {
		let classes = 'console-messages native-key-bindings ' + (this.linewrap ? 'linewrap' : '');
		return <div className={classes} ref="log" attributes={{ tabindex:'-1', 'data-min-level': this.level }}>
			{this.filteredChildren}
		</div>;
	}

	update(opts) {
		if (opts) {
			this.updateOpts(opts);
		}
		return etch.update(this);
	}

	updateOpts(opts) {
		this.autoScroll = opts.autoScroll;
		this.linewrap = opts.linewrap;
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
			return false;
		}
		this.filter = filter;
		this.filterRegExp = RegExp(filter, 'i');

		this.filteredChildren = [];
		for (let { text, level } of this.children) {
			this.addLineIfMatchesFilter(text, level);
		}
		this.update();
	}

	write(text, level) {
		this.children.push({ level: level, text: text });
		this.addLineIfMatchesFilter(text, level);
		this.update();
	}

	addLineIfMatchesFilter(text, level) {
		if (this.matchesFilter(text)) {
			this.filteredChildren.push(<p className={`log ${level}`}>{text}</p>);
		}
	}

	matchesFilter(text) {
		if (!this.filter) {
			return true;
		} else {
			return this.filterRegExp.test(text);
		}
	}

	clear() {
		this.children = [];
		this.filteredChildren = [];
		this.update();
	}
}
