/** @babel */
/** @jsx etch.dom */

import etch from 'etch';
import { DataSet, Timeline as VisTimeline } from '../../vis-custom';

import {matcherFactory} from './matchers';

const config = {
	matchers: [
		// {
		// 	type: 'simple',
		// 	open: 'a',
		// 	close: 'b',
		// 	name: 'test ab',
		// 	group: undefined
		// },
		{
			type: 'paired',
			open: 'b(.)',
			close: 'a(.)',
			name: 'test',
			group: undefined
		}
	]
};

export default class Timeline {

	constructor(opts) {
		this.updateOpts(opts);
		etch.initialize(this);

		this.data = new DataSet();
		this.matchers = [];
		this.openEvents = [];
		// TODO open and parse file to load config.
		this.loadMatchers(config);
	}

	loadMatchers() {
		config.matchers.forEach((matcherConfig) => {
			this.matchers.push(matcherFactory(matcherConfig));
		});
	}

	loadTimeline() {
		let container = document.getElementById('timeline-container');
		let options = {
			min: Date.now(),
			start: Date.now(),
			end: Date.now() + (2 * 60 * 1000),
		};
		this.timeline = new VisTimeline(container, this.data, null, options);
	}

	writeLine(line) {
		this.testMatches(line);
	}

	testMatches(line) {
		for (let [index, event] of this.openEvents.entries()) {
			if (event.matcher.checkClose(line)) {
				this.closeEvent(event);
				this.openEvents.splice(index , 1);
				console.log('removing closed event', this.openEvents.length);
				return;
			}
		}
		this.matchers.forEach((matcher) => {
			if (matcher.checkOpen(line)) {
				this.openEvents.push(this.createOpenEvent(matcher, line));
				console.log('adding open event', this.openEvents.length);
				//TODO stop checking matchers once one found?
			}
		});
	}

	createOpenEvent(matcher, line) {
		return {
			content: matcher.getName(line),
			matcher: matcher,
			start: Date.now(),
			type: 'range',
		};
	}

	closeEvent(event) {
		this.data.add({
			content: event.content,
			start: event.start,
			end: Date.now(),
			type: 'range'
		});
		event = null;
	}

	render() {
		return <div id="timeline-container" className="appc-timeline native-key-bindings"></div>;
	}

	update(opts) {
		if (opts) {
			this.updateOpts(opts);
		}
		return etch.update(this);
	}

	updateOpts(opts) {
	}

	async destroy() {
		await etch.destroy(this);
	}
}
