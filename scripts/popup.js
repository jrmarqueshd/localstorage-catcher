"use strict";

var jsonViewer = new JSONViewer();

document.querySelector("#json").appendChild(jsonViewer.getContainer());

const List = document.getElementById("list");

function onSelectKey(itemId) {
  try {
    chrome.tabs.query({ currentWindow: true, active: true }, async function ([tab]) {
      const [response] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (itemId) => localStorage.getItem(itemId),
        args: [itemId],
      });

      let _obj = JSON.parse(response.result);

      Object.keys(_obj).forEach((name) => {
        _obj = {
          ..._obj,
          [name]: JSON.parse(_obj[name]),
        };
      });

      jsonViewer.showJSON(_obj, -1, -1);
    });
  } catch (error) {
    console.log(error);
  }
}

function updateSelectedKey(tabId, newKey) {
  chrome.storage.local.get({ selectedKeys: {} }, function (result) {
    const selectedKeys = result.selectedKeys;
    selectedKeys[tabId] = newKey;
    chrome.storage.local.set({ selectedKeys });
  });
}

chrome.tabs.query({ currentWindow: true, active: true }, async function ([tab]) {
  try {
    const [response] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => Object.keys(localStorage),
    });
    const tabId = tab.id;

    chrome.storage.local.get({ selectedKeys: {} }, function (result) {
      const selectedKeys = result.selectedKeys;
      const selectedKey = selectedKeys[tabId] || null;

      response.result.forEach((key) =>
        List.insertAdjacentHTML(
          "afterbegin",
          `<li class="button-key ${key === selectedKey ? 'selected' : ''}" id="${key}" title="${key}">
            <input type="checkbox" ${key === selectedKey ? 'checked' : ''} />
            <span>${key}</span>
          </li>`
        )
      );

			const checkboxes = document.querySelectorAll(".button-key input[type='checkbox']");
			checkboxes.forEach((checkbox) => {
					checkbox.addEventListener("click", (e) => {
							if (e.target.checked) {
									// Se o checkbox for marcado, desmarque os outros
									checkboxes.forEach(cb => {
											if (cb !== e.target) { // Não desmarque o checkbox que foi clicado
													cb.checked = false;
													cb.closest('li').classList.remove('selected');
											}
									});
									const listItem = e.target.closest('li');
									onSelectKey(listItem.id);
									updateSelectedKey(tabId, listItem.id);
									listItem.classList.add('selected');
							} else {
									// Se o checkbox for desmarcado, remova a seleção e limpe o jsonViewer
									const listItem = e.target.closest('li');
									listItem.classList.remove('selected');
									updateSelectedKey(tabId, null); // Remove a chave selecionada do localStorage
									jsonViewer.showJSON({}, -1, -1); // Limpa o jsonViewer
							}
					});
			});
			
      // Abrir automaticamente o item selecionado
      if (selectedKey) {
        onSelectKey(selectedKey);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
});
