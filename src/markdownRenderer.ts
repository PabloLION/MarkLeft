import { marked } from 'marked';
import * as katex from 'katex';

export class MarkdownRenderer {
	private renderer: marked.Renderer;

	constructor() {
		this.renderer = new marked.Renderer();
		this.setupRenderer();
		this.setupMarked();
	}

	private setupRenderer() {
		// Override link renderer to handle wiki-links
		this.renderer.link = (href: string, title: string | null | undefined, text: string) => {
			// Handle wiki-links [[text]]
			if (href.startsWith('[[') && href.endsWith(']]')) {
				const linkText = href.slice(2, -2);
				return `<a href="#" class="wiki-link" data-link="${linkText}">${text || linkText}</a>`;
			}
			
			// Regular links
			const titleAttr = title ? ` title="${title}"` : '';
			return `<a href="${href}"${titleAttr} target="_blank" rel="noopener">${text}</a>`;
		};

		// Enhanced table renderer
		this.renderer.table = (header: string, body: string) => {
			return `<div class="table-container">
				<table class="enhanced-table">
					<thead>${header}</thead>
					<tbody>${body}</tbody>
				</table>
			</div>`;
		};

		// Enhanced code block renderer for diagrams and syntax highlighting
		this.renderer.code = (code: string, language: string | undefined) => {
			if (language === 'mermaid') {
				return `<div class="mermaid-container">
					<div class="mermaid">${code}</div>
				</div>`;
			}
			
			if (language === 'plantuml') {
				return `<div class="plantuml-container">
					<div class="plantuml">${code}</div>
				</div>`;
			}

			// Regular code blocks with syntax highlighting
			const lang = language || 'text';
			return `<pre class="code-block"><code class="language-${lang}">${this.escapeHtml(code)}</code></pre>`;
		};

		// Enhanced paragraph renderer for LaTeX
		this.renderer.paragraph = (text: string) => {
			// Process inline LaTeX $...$
			text = text.replace(/\$([^$]+)\$/g, (match, latex) => {
				try {
					// Sanitize LaTeX input to prevent potential security issues
					const sanitizedLatex = this.sanitizeLatex(latex);
					return katex.renderToString(sanitizedLatex, { 
						throwOnError: false,
						strict: 'warn',
						maxSize: 50,
						maxExpand: 100
					});
				} catch (e) {
					console.warn('KaTeX rendering error for inline math:', e);
					return `<span class="latex-error" title="LaTeX Error: ${e instanceof Error ? e.message : 'Unknown error'}">${match}</span>`;
				}
			});

			// Process block LaTeX $$...$$
			text = text.replace(/\$\$([^$]+)\$\$/g, (match, latex) => {
				try {
					// Sanitize LaTeX input to prevent potential security issues
					const sanitizedLatex = this.sanitizeLatex(latex);
					return katex.renderToString(sanitizedLatex, { 
						throwOnError: false, 
						displayMode: true,
						strict: 'warn',
						maxSize: 50,
						maxExpand: 100
					});
				} catch (e) {
					console.warn('KaTeX rendering error for block math:', e);
					return `<div class="latex-error" title="LaTeX Error: ${e instanceof Error ? e.message : 'Unknown error'}">${match}</div>`;
				}
			});

			return `<p>${text}</p>`;
		};
	}

	private setupMarked() {
		marked.setOptions({
			renderer: this.renderer,
			highlight: function(code: string, lang?: string) {
				// This will be enhanced with highlight.js
				return code;
			},
			pedantic: false,
			gfm: true,
			breaks: false,
			sanitize: false,
			smartypants: false,
			xhtml: false
		});
	}

	public render(markdown: string): string {
		// Pre-process wiki-links
		markdown = this.processWikiLinks(markdown);
		
		// Pre-process focus mode highlighting
		markdown = this.processFocusMode(markdown);

		return marked(markdown);
	}

	private processWikiLinks(markdown: string): string {
		// Convert [[link]] to proper markdown links
		return markdown.replace(/\[\[([^\]]+)\]\]/g, (match, linkText) => {
			const parts = linkText.split('|');
			const link = parts[0].trim();
			const display = parts[1] ? parts[1].trim() : link;
			return `[${display}](${match})`; // Keep original format for renderer
		});
	}

	private processFocusMode(markdown: string): string {
		// This will be enhanced based on focus mode settings
		return markdown;
	}

	private sanitizeLatex(latex: string): string {
		// Basic LaTeX sanitization to prevent malicious expressions
		// Remove potentially dangerous commands
		const dangerousCommands = [
			'\\input', '\\include', '\\write', '\\immediate',
			'\\openout', '\\closeout', '\\catcode', '\\def',
			'\\let', '\\expandafter', '\\csname', '\\endcsname'
		];
		
		let sanitized = latex.trim();
		dangerousCommands.forEach(cmd => {
			const regex = new RegExp(cmd.replace('\\', '\\\\'), 'gi');
			sanitized = sanitized.replace(regex, '');
		});
		
		// Limit length to prevent DoS
		if (sanitized.length > 1000) {
			sanitized = sanitized.substring(0, 1000);
		}
		
		return sanitized;
	}

	private escapeHtml(text: string): string {
		// Simple HTML escaping for server-side rendering
		return text
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
	}

	public renderToHtml(markdown: string, options?: any): string {
		const rendered = this.render(markdown);
		
		return `
			<div class="markdown-content" data-focus-mode="${options?.focusMode || 'off'}">
				${rendered}
			</div>
		`;
	}
}