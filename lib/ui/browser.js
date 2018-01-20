'use babel';
/** @jsx etch.dom */

import etch from 'etch';

import { CompositeDisposable } from 'atom';

export default class Browser {

	constructor() {
		this.state = {
			url: ''
		};

		etch.initialize(this);
	}

	async destroy() {
		await etch.destroy(this);
	}

	render() {
		return <div className="appc-browser">
			<div className="webview-container">
				<webview src={this.state.url}></webview>
			</div>
		</div>;
	}

	update() {
		return etch.update(this);
	}

	getTitle() {
		return 'devtools';
	}

	show() {
		atom.workspace.open(this);
	}

	setUrl(url) {
		this.state.url = url;
		this.update();
	}
};
