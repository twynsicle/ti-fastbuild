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

		this.subscriptions = new CompositeDisposable();
		this.subscriptions.add(atom.commands.add('atom-workspace', {
			'atom-browser:showHide': () => this.show(),
		}));
	}

	async destroy() {
		this.subscriptions.dispose();
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
