import * as assert from 'assert';
import { MarkdownRenderer } from '../markdownRenderer';

suite('MarkdownRenderer Test Suite', () => {
	let renderer: MarkdownRenderer;

	setup(() => {
		renderer = new MarkdownRenderer();
	});

	test('Basic markdown rendering', () => {
		const input = '# Hello World\n\nThis is **bold** text.';
		const output = renderer.render(input);
		
		assert.ok(output.includes('<h1>Hello World</h1>'));
		assert.ok(output.includes('<strong>bold</strong>'));
	});

	test('Wiki link processing', () => {
		const input = 'Check out [[My Page]] for more info.';
		const output = renderer.render(input);
		
		assert.ok(output.includes('wiki-link'));
		assert.ok(output.includes('data-link="My Page"'));
	});

	test('LaTeX rendering', () => {
		const input = 'Math: $E = mc^2$';
		const output = renderer.render(input);
		
		// Should contain KaTeX rendered content
		assert.ok(output.includes('katex') || output.includes('math'));
	});

	test('Code block processing', () => {
		const input = '```javascript\nconsole.log("hello");\n```';
		const output = renderer.render(input);
		
		assert.ok(output.includes('code-block'));
		assert.ok(output.includes('language-javascript'));
	});

	test('Mermaid diagram processing', () => {
		const input = '```mermaid\ngraph TD\nA --> B\n```';
		const output = renderer.render(input);
		
		assert.ok(output.includes('mermaid-container'));
		assert.ok(output.includes('mermaid'));
	});
});