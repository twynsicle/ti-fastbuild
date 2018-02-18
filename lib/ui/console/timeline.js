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
			open: '.* startTimer (.*)',
			close: '.* stopTimer (.*)',
			name: 'timer',
			long: true,
			group: undefined
		},
		{
			type: 'paired',
			// eslint-disable-next-line no-useless-escape
			open: '.*\\[api\\] POST call: (.*)\\?.*',
			// eslint-disable-next-line no-useless-escape
			close: '.*\\[api\\] success - POST url: (.*)\\?.*',
			name: 'post',
			long: false,
			group: undefined
		}
	]
};

export default class Timeline {

	constructor(opts) {
		this.updateOpts(opts);
		etch.initialize(this);

		this.initialize();
	}

	initialize() {
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
		if (this.timeline) {
			this.destroyTimeline();
			this.initialize();
		}
		// eslint-disable-next-line no-undef
		let container = document.getElementById('timeline-container');
		let options = {
			min: Date.now(),
			start: Date.now(),
			end: Date.now() + (3 * 60 * 1000),
			height: '200px',
			showTooltips: true,
			tooltip: {
				followMouse: false
			}
		};
		this.timeline = new VisTimeline(container, this.data, null, options);
		this.timeline.on('itemover', (event) => {
			let item = this.data.get(event.item);
			this.console.highlight(this.getHighLightText(item));
		});
		this.timeline.on('itemout', () => {
			this.console.highlight('');
		});
		this.update();
	}

	getHighLightText(item) {
		if (item.className === 'open') {
			return item.content;
		} else {
			return item.content + ' - ' + ((item.end - item.start) / 1000) + 's';
		}
	}

	writeLine(line) {
		this.testMatches(line);
	}

	testMatches(line) {
		for (let [index, event] of this.openEvents.entries()) {
			if (event.checkClose(line)) {
				this.closeEvent(event);
				this.openEvents.splice(index, 1);
				console.log('removing closed event', this.openEvents.length, line);
				return;
			}
		}
		this.matchers.forEach((matcher) => {
			if (this.newLineEqualsMatcherWaitingClose(line)) {
				// prevent dupes
				return;
			}
			if (matcher.checkOpen(line)) {
				let openEvent = this.createOpenEvent(matcher, line);
				this.openEvents.push(openEvent);
				this.addOpenEventToTimeline(openEvent);
				console.log('adding open event', this.openEvents.length, line);
				//TODO stop checking matchers once one found?
				if (!this.data.length === 1) {
					// first event
					//TODO test
					/*this.timeline.setOptions({
						min: Date.now(),
						start: Date.now()
					});*/
				}
			}
		});
	}

	createOpenEvent(matcher, line) {
		return {
			content: matcher.getName(line),
			title: matcher.getName(line), // add type as well? // TODO add duration
			matcher: matcher,
			checkClose: matcher.getCheckCloseFunction(line),
			start: Date.now(),
			type: 'range',
			isLong: matcher.long,
			line: line
		};
	}

	addOpenEventToTimeline(event) {
		let ids = this.data.add({
			id: event.id,
			content: event.content,
			start: event.start,
			end: event.start + (event.isLong ? 20000 : 1000),
			type: 'range',
			className: 'open'
		});
		event.id = ids[0];
	}

	closeEvent(event) {
		let timelineEvent = this.data.get(event.id);
		if (!timelineEvent) {
			// eslint-disable-next-line no-undef
			console.error('help!');
		}
		timelineEvent.end = Date.now();
		timelineEvent.className = 'closed';
		this.data.update(timelineEvent);

		event = null;
	}

	newLineEqualsMatcherWaitingClose(line) {
		let matchFound = false;
		this.openEvents.forEach((event) => {
			if (event.line === line) {
				matchFound = true;
				//TODO this is doing some extra loops
			}
		});
		return matchFound;
	}

	render() {
		let classNames = 'appc-timeline native-key-bindings ' + (this.timeline ? 'active' : '');
		return <div id="timeline-container" className={classNames}></div>;
	}

	update(opts) {
		if (opts) {
			this.updateOpts(opts);
		}
		return etch.update(this);
	}

	updateOpts(opts) {
		this.console = opts.console;
	}

	createId() {
		let possible = 'abcdefgh';
		let id = '';
		for (let i = 0; i < 4; i += 1) {
			id += possible.charAt(Math.floor(Math.random() * possible.length));
		}
		return id;
	}

	async destroy() {
		this.destroyTimeline();
		await etch.destroy(this);
	}

	async destroyTimeline() {
		this.data = [];
		this.timeline.destroy();
		this.timeline = null;
	}
}
