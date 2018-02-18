/** @babel */

export class SimpleMatcher {
	constructor(config) {
		this.openRegex = new RegExp('^' + config.open + '$');
		this.closeRegex = new RegExp('^' + config.close + '$');

		this.name = config.name;
		this.group = config.group;
		this.long = config.long;
	}

	checkOpen(line) {
		return this.openRegex.test(line);
	}

	getCheckCloseFunction(openingLine) {
		return (closingLine) => {
			return this.closeRegex.test(closingLine);
		};
	}

	getName(line) {
		return this.name;
	}
}

//TODO ignore inbetween logs?
export class PairedMatcher {
	constructor(config) {
		//TODO case insensitive
		this.openRegex = new RegExp('^' + config.open + '$');
		this.closeRegex = new RegExp('^' + config.close + '$');

		this.name = config.name;
		this.group = config.group;
		this.long = config.long;
	}

	checkOpen(line) {
		return !!this.getKey(line);
	}

	getCheckCloseFunction(openingLine) {
		let key = this.getKey(openingLine);
		if (!key) {
			console.error('help');
		}
		return (closingLine) => {
			return this.checkClose(closingLine, key);
		};
	}

	checkClose(line, key) {
		let matches = line.match(this.closeRegex);
		if (matches && matches.length) {
			if (key === matches[1]) {
				return true;
			}
		}
		return false;
	}

	getName(line) {
		//return this.name + ' ' + this.key;
		return this.getKey(line);
	}

	getKey(line) {
		let matches = line.match(this.openRegex);
		if (matches && matches.length) {
			return matches[1];
		}
		return false;
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
