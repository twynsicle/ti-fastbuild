'use babel';
/** @jsx etch.dom */

import etch from 'etch';

import { SETTINGS } from '../settings';

export default class Browser {

	constructor(settings) {
		this.settings = settings;
		this.state = {
			url: ''
		};

		etch.initialize(this);
	}

	async destroy() {
		await etch.destroy(this);
	}

	render() {
		return <div id="appc-browser" className="appc-browser native-key-bindings" on={{ contextmenu: this.onContextMenu }}>
			<div className="webview-container">
				<webview src={this.state.url} tabindex="-1" on={{ 'dom-ready': this.onReady }}/>
			</div>
		</div>;
	}

	onContextMenu(e) {
		e.preventDefault();
		e.cancelBubble = true;
		return false;
	}

	onReady(e) {
		e.target.focus();

		this.skipFirstBreakpoint();
	}

	skipFirstBreakpoint() {
		if (this.settings.get(SETTINGS.DEBUGGER.SKIP_FIRST_BREAKPOINT)) {
			setTimeout(() => {
				// eslint-disable-next-line no-undef
				let webview = document.querySelector('webview');
				webview.sendInputEvent({ type: 'keyDown', keyCode: 'F8' });
			}, 1000);

		}
	}

	update() {
		return etch.update(this);
	}

	getTitle() {
		return 'debugger';
	}

	show() {
		atom.workspace.open(this, {
			activatePane: true,
			activateItem: true,
			searchAllPanes: true
		});
	}

	setUrl(url) {
		this.state.url = url;
		this.update();
	}
}
