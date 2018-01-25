# Atom plugin for Titanium

This is a fork of the official plugin at https://github.com/appcelerator/atom-appcelerator-titanium

Offers the following additional features:
* Fastbuild - rather than building from scratch each time, a filewatcher copies changed files into the existing apk
* Automatically opens the debugger within atom (requires Titanium 7 build)
* Enhanced console

## Getting Started
* Only supports windows
* Add the android build-tools to your path - C:\Users\{user.name}\AppData\Local\Android\Sdk\build-tools\27.0.3
* Debug builds require Titanium 7
* Runs builds via `appc run` this might require you to register your apps guid if you haven't already.

## Features

### Run
![image](https://user-images.githubusercontent.com/1037362/35406904-0f61747e-026f-11e8-87af-3ff8d9be9849.png)
* Run (alt-f9)
* Debug (alt-f10) add debug flags to build, requires Titanium 7, will allow you to debug your application within atom using the Chrome Dev tools.
* Fastbuild (alt-f11) see below

### Debugging
As long as the debug flag is present in the build, the extension scans logs look for the developer tools link and automatically opens it up within atom.
By default Titanium 7 breaks on the first execution line, however this plugin will skip that. There is an option in the settings menu if you want to return to the default behavior.
The dev tools  slightly more limited than what is present in Chrome, but will give you access to the source and console - use ctrl-p to search for a file.

![image](https://user-images.githubusercontent.com/1037362/35407196-07875df8-0270-11e8-9e3d-9c3b68451924.png)

### Fastbuild
This consists of two parts
a) a file watcher that observes all changes to your /Resources directory and copies the changes into the unsigned apk in the build directory.
b) the fastbuild button, this re-signs the apk and redeploys it to your device, hooking up logcat and the debugger.

Notes: 
* this only looks for JavaScript files
* this will only work for changed files, added and deleted files will need a new build, this is because the Titanium build process indexes JavaScript files so you'll need to rebuild to have them included in the index.
* Even if nothing has changed, fastbuild serves as a useful way of re-deploying a previous build to your device in a way that hooks up logcat and the debugger.

### Console
This displays android logcat logs filtered to the pid of your deployed app. This does not log app crashes, so if you want to investigate a crash you'll need Android Studios logcat open.

It also comes with a couple of features over the official Titanium atom plugin:
![image](https://user-images.githubusercontent.com/1037362/35407623-7508e440-0271-11e8-9386-9a1f413b0400.png)
* Filter lines by regular expression
* Set minimum log level to show, this can be changed while the app is running (the official plugin sets the build log level)
* Automatically scrolls to bottom
* Clear logs (ctrl-l), by default the console will also clear build logs after a successful build

### Additional Configuration
Addtional settings are available via the cog in the top right-hand corner
![image](https://user-images.githubusercontent.com/1037362/35407782-e25469ac-0271-11e8-83c5-fa9b6bf8c5bf.png)
