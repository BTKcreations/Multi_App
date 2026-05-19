function escapeHtml(text) {
  if (text == null) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const tests = [
  { input: 'Hello World', expected: 'Hello World' },
  { input: '<div>', expected: '&lt;div&gt;' },
  { input: 'a & b', expected: 'a &amp; b' },
  { input: '"test"', expected: '&quot;test&quot;' },
  { input: "'test'", expected: '&#39;test&#39;' },
  { input: '&&&', expected: '&amp;&amp;&amp;' },
  { input: '<>"\'&', expected: '&lt;&gt;&quot;&#39;&amp;' },
  { input: null, expected: '' },
  { input: undefined, expected: '' }
];

let failed = false;
for (const test of tests) {
  const result = escapeHtml(test.input);
  if (result !== test.expected) {
    console.error(`Test failed! Input: ${test.input}, Expected: ${test.expected}, Got: ${result}`);
    failed = true;
  }
}

if (!failed) {
  console.log("All tests passed!");
} else {
  process.exit(1);
}
