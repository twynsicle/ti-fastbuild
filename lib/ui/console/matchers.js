/** @babel */

export class SimpleMatcher {
	constructor(config) {
		this.openRegex = new RegExp('^' + config.open + '$');
		this.closeRegex = new RegExp('^' + config.close + '$');

		this.name = config.name;
		this.group = config.group;
	}

	checkOpen(line) {
		return this.openRegex.test(line);
	}

	checkClose(line) {
		return this.closeRegex.test(line);
	}

	getName(line) {
		return this.name;
	}
}

export class PairedMatcher {
	constructor(config) {
		this.openRegex = new RegExp('^' + config.open + '$');
		this.closeRegex = new RegExp('^' + config.close + '$');

		this.name = config.name;
		this.group = config.group;
	}

	checkOpen(line) {
		let matches = line.match(this.openRegex);
		if (matches && matches.length) {
			this.key = matches[1];
			return true;
		}
		return false;
	}

	checkClose(line) {
		let matches = line.match(this.closeRegex);
		if (matches && matches.length) {
			if (this.key === matches[1]) {
				return true;
			}
		}
		return false;
	}

	getName(line) {
		return this.name + ' ' + this.key;
	}
}

export function matcherFactory(matcherConfig) {
	switch (matcherConfig.type) {
		case 'simple':
			return new SimpleMatcher(matcherConfig);
		case 'paired':
			return new PairedMatcher(matcherConfig);
	}
}
