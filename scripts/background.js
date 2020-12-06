"use strict";

chrome.runtime.onInstalled.addListener(function () {
	chrome.storage.sync.get(["persist:store"], function (result) {
		console.log({ ...result });
	});

	// console.log(chrome.windows.getAll());
});
