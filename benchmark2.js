const { performance } = require('perf_hooks');

const htmlEscapes = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};
const reUnescapedHtml = /[&<>"']/g;
const reHasUnescapedHtml = RegExp(reUnescapedHtml.source);

function escapeHtmlMap(text) {
  if (text == null) return '';
  const string = String(text);
  return (string && reHasUnescapedHtml.test(string))
    ? string.replace(reUnescapedHtml, (chr) => htmlEscapes[chr])
    : string;
}

function escapeHtmlChain(text) {
  if (text == null) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const testStrings = [
  "Hello World",
  "<div>Hello & Welcome!</div>",
  "This is a \"test\" string with 'quotes' and <tags>.",
  "No special characters here.",
  "&&&& <<<< >>>> '''' \"\"\"\"",
  Array(10).fill("<div>test</div>").join("")
];

const iterations = 100000;

function runBenchmark(name, fn) {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    for (const str of testStrings) {
      fn(str);
    }
  }
  const end = performance.now();
  const timeMs = end - start;
  console.log(`${name}: ${timeMs.toFixed(2)} ms`);
  return timeMs;
}

runBenchmark("Map", escapeHtmlMap);
runBenchmark("Chain", escapeHtmlChain);
