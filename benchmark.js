const { performance } = require('perf_hooks');
const { JSDOM } = require('jsdom');

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
const document = dom.window.document;

// Original
function escapeHtmlOriginal(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

const htmlEscapes = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};
const reUnescapedHtml = /[&<>"']/g;
const reHasUnescapedHtml = RegExp(reUnescapedHtml.source);

// Optimized
function escapeHtmlOptimized(text) {
  if (text == null) return '';
  const string = String(text);
  return (string && reHasUnescapedHtml.test(string))
    ? string.replace(reUnescapedHtml, (chr) => htmlEscapes[chr])
    : string;
}

const testStrings = [
  "Hello World",
  "<div>Hello & Welcome!</div>",
  "This is a \"test\" string with 'quotes' and <tags>.",
  "No special characters here.",
  "&&&& <<<< >>>> '''' \"\"\"\"",
  Array(10).fill("<div>test</div>").join("")
];

const iterations = 10000;

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

const t1 = runBenchmark("Original", escapeHtmlOriginal);
const t2 = runBenchmark("Optimized", escapeHtmlOptimized);

console.log(`Improvement: ${((t1 - t2) / t1 * 100).toFixed(2)}% faster`);
