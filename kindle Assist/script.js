document.addEventListener('DOMContentLoaded', function () {
  const input1 = document.getElementById('input1');
  const kanaOutput1 = document.getElementById('kanaOutput1');
  const romajiOutput1 = document.getElementById('romajiOutput1');

  const input2 = document.getElementById('input2');
  const kanaOutput2 = document.getElementById('kanaOutput2');
  const romajiOutput2 = document.getElementById('romajiOutput2');

  const input3 = document.getElementById('input3');
  const kanaOutput3 = document.getElementById('kanaOutput3');
  const romajiOutput3 = document.getElementById('romajiOutput3');

  const convertButton = document.getElementById('convertButton');

  convertButton.addEventListener('click', function () {
    const text1 = input1.value;
    const kanaResult1 = wanakana.toKatakana(text1);
    const romajiResult1 = wanakana.toRomaji(text1);
    kanaOutput1.value = kanaResult1;
    romajiOutput1.value = romajiResult1;

    const text2 = input2.value;
    const kanaResult2 = wanakana.toKatakana(text2);
    const romajiResult2 = wanakana.toRomaji(text2);
    kanaOutput2.value = kanaResult2;
    romajiOutput2.value = romajiResult2;

    const text3 = input3.value;
    const kanaResult3 = wanakana.toKatakana(text3);
    const romajiResult3 = wanakana.toRomaji(text3);
    kanaOutput3.value = kanaResult3;
    romajiOutput3.value = romajiResult3;
  });
});
