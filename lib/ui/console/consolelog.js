/** @babel */
/** @jsx etch.dom */

import { CompositeDisposable } from 'atom';
import { platform } from 'os';

import etch from 'etch';

export default class ConsoleLog {

	constructor(opts) {
		this.children = [];
		this.autoScroll = opts.autoScroll;
		etch.initialize(this);
	}

	async destroy() {
		await etch.destroy(this);
	}

	render() {
		return <div className="console-messages native-key-bindings" ref="log" attributes={{ tabindex:'-1' }}>
			{this.children}
		</div>;
	}

	update(opts) {
		if (opts) {
			this.autoScroll = opts.autoScroll;
		}
		return etch.update(this);
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
