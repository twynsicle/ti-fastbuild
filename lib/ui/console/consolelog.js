/** @babel */
/** @jsx etch.dom */

import { CompositeDisposable } from 'atom';
import { platform } from 'os';

import etch from 'etch';

export default class ConsoleLog {

	constructor(opts) {
		this.children = [];
		this.updateOpts(opts);
		etch.initialize(this);
	}

	async destroy() {
		await etch.destroy(this);
	}

	render() {
		let classes = 'console-messages native-key-bindings ' + (this.linewrap ? 'linewrap' : '');
		return <div className={classes} ref="log" attributes={{ tabindex:'-1' }}>
			{this.children}
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
	}

	readAfterUpdate() {
		if (this.autoScroll) {
			this.refs.log.scrollTop = this.refs.log.scrollHeight;
		}
	}

	write(text, level) {
		this.children.push(<p className={`log ${level}`}>{text}</p>);
		this.update();
	}

	clear() {
		this.children = [];
		this.update();
	}
}
