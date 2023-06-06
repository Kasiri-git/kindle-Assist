// input.js

document.addEventListener('DOMContentLoaded', function() {
  // 追加ボタンがクリックされた時の処理
  document.getElementById('additionalButton').addEventListener('click', function() {
    // 各要素の値を取得
    var input1Value = document.getElementById('input1').value;
    var kanaOutput1Value = document.getElementById('kanaOutput1').value;
    var romajiOutput1Value = document.getElementById('romajiOutput1').value;
    var input2Value = document.getElementById('input2').value;
    var kanaOutput2Value = document.getElementById('kanaOutput2').value;
    var romajiOutput2Value = document.getElementById('romajiOutput2').value;
    var input3Value = document.getElementById('input3').value;
    var kanaOutput3Value = document.getElementById('kanaOutput3').value;
    var romajiOutput3Value = document.getElementById('romajiOutput3').value;

    // アクティブなタブでスクリプトを実行して値を貼り付ける
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.executeScript(tabs[0].id, {
        code: `
          document.getElementById('data-title').value = '${input1Value}';
          document.getElementById('data-title-pronunciation').value = '${kanaOutput1Value}';
          document.getElementById('data-title-romanized').value = '${romajiOutput1Value}';
          document.getElementById('data-subtitle').value = '${input2Value}';
          document.getElementById('data-subtitle-pronunciation').value = '${kanaOutput2Value}';
          document.getElementById('data-subtitle-romanized').value = '${romajiOutput2Value}';
          document.getElementById('data-publisher-label').value = '${input3Value}';
          document.getElementById('data-publisher-label-pronunciation').value = '${kanaOutput3Value}';
          document.getElementById('data-publisher-label-romanized').value = '${romajiOutput3Value}';
        `
      });
    });
  });
});
