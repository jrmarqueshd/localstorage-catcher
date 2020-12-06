"use strict";

var jsonViewer = new JSONViewer();

document.querySelector("#json").appendChild(jsonViewer.getContainer());

class Console {
	log = (data) => {
		return chrome.extension.getBackgroundPage().console.log(data);
	};
}

const _console = new Console();

const List = document.getElementById("list");

function onSelectKey(id) {
	try {
		chrome.tabs.query(
			{ currentWindow: true, active: true },
			async function ([tabs]) {
				const [response] = await chrome.tabs.executeScript(tabs.id, {
					code: `localStorage['${id}']`,
				});

				let _obj = JSON.parse(response);

				Object.keys(_obj).forEach((name) => {
					_obj = {
						..._obj,
						[name]: JSON.parse(_obj[name]),
					};
				});

				jsonViewer.showJSON(_obj, -1, -1);
			}
		);
	} catch (error) {
		_console.log(error);
	}
}

chrome.tabs.query({ currentWindow: true, active: true }, async function (tabs) {
	const [response] = await chrome.tabs.executeScript(tabs.id, {
		code: `Object.keys(localStorage)`,
	});

	response.map((each) =>
		List.insertAdjacentHTML(
			"afterbegin",
			`<li class="button-key" id="${each}" title="${each}">${each}</li>`
		)
	);

	var buttons = document.querySelectorAll(".button-key");

	buttons.forEach((button) => {
		button.addEventListener("click", (e) => onSelectKey(e.target.id));
	});
});
