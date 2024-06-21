"use strict";

var jsonViewer = new JSONViewer();

document.querySelector("#json").appendChild(jsonViewer.getContainer());

const List = document.getElementById("list");

function onSelectKey(itemId) {
	try {
		chrome.tabs.query({ currentWindow: true, active: true }, async function ([tab]) {
				const [response] = await chrome.scripting.executeScript({
					target: {tabId: tab.id},
					func: (itemId) => localStorage.getItem(itemId),
					args: [itemId]
				});

				let _obj = JSON.parse(response.result);

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
		console.log(error);
	}
}
chrome.tabs.query({ currentWindow: true, active: true }, async function ([tab]) {
	try{
		const [response] = await chrome.scripting.executeScript({
			target: {tabId: tab.id},
			func: () => Object.keys(localStorage)
		});

		response.result.map((each) =>
			List.insertAdjacentHTML(
				"afterbegin",
				`<li class="button-key" id="${each}" title="${each}">${each}</li>`
			)
		);

		const buttons = document.querySelectorAll(".button-key");

		buttons.forEach((button) => {
			button.addEventListener("click", (e) => onSelectKey(e.target.id));
		});
	} catch (error) {
		console.log(error.message)
	}
});

