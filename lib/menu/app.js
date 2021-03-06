module.exports = {
	items: [
		{
			label: 'Packages',
			submenu: [
				{
					label: 'Appcelerator Titanium',
					submenu: [
						{ label: 'Build', command: 'appc:build' },
						{ label: 'Build Debug', command: 'appc:debug' },
						{ label: 'Build FastBuild', command: 'appc:fast-build' },
						{ label: 'Reload app', command: 'appc:reload' },
						{ label: 'Clean Build', command: 'appc:clean' },
						{ type: 'separator' },
						{ label: 'Toggle Console', command: 'appc:console:toggle' },
						{ label: 'Open related view', command: 'appc:open-related-view' },
						{ label: 'Open related style', command: 'appc:open-related-style' },
						{ label: 'Open related controller', command: 'appc:open-related-controller' },
						{ label: 'Toggle related files', command: 'appc:open-or-close-related' }
					]
				}
			]
		}
	]
};
