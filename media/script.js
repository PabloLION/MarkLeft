// MarkLeft Editor JavaScript

(function() {
    'use strict';

    // Global state
    let editorState = {
        currentMode: 'selective', // 'selective', 'source', 'preview'
        tocVisible: false,
        frontmatterCollapsed: true,
        focusMode: 'normal', // 'normal', 'typewriter', 'focus', 'zen'
        currentEditingElement: null
    };

    // Get VSCode API
    const vscode = acquireVsCodeApi();

    // Initialize editor when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeEditor);
    } else {
        initializeEditor();
    }

    function initializeEditor() {
        console.log('Initializing MarkLeft editor...');
        
        // Set up event listeners
        setupEventListeners();
        
        // Initialize components
        initializeTableOfContents();
        initializeFrontmatter();
        initializeSelectiveEditing();
        
        // Apply initial configuration
        applyConfiguration();
        
        console.log('MarkLeft editor initialized');
    }

    function setupEventListeners() {
        // Handle clicks for selective editing
        document.addEventListener('click', handleDocumentClick);
        
        // Handle keyboard shortcuts
        document.addEventListener('keydown', handleKeyboardShortcuts);
        
        // Handle window resize for responsive features
        window.addEventListener('resize', handleWindowResize);
        
        // Handle scroll for TOC active item highlighting
        window.addEventListener('scroll', handleScroll);
    }

    function handleDocumentClick(event) {
        const target = event.target;
        
        // Handle TOC item clicks
        if (target.classList.contains('markleft-toc-item')) {
            event.preventDefault();
            scrollToHeading(target.dataset.headingId);
            return;
        }
        
        // Handle frontmatter toggle
        if (target.closest('.markleft-frontmatter.collapsed')) {
            event.preventDefault();
            toggleFrontmatter();
            return;
        }
        
        // Handle selective editing clicks
        if (editorState.currentMode === 'selective') {
            handleSelectiveEditingClick(event);
        }
    }

    function handleSelectiveEditingClick(event) {
        const target = event.target;
        const editableElement = target.closest('.markleft-editable');
        
        if (editableElement && !editableElement.classList.contains('markleft-editing')) {
            event.preventDefault();
            enterEditMode(editableElement);
        }
    }

    function enterEditMode(element) {
        // Exit any current editing mode
        if (editorState.currentEditingElement) {
            exitEditMode(editorState.currentEditingElement);
        }
        
        // Store original content
        const originalContent = element.textContent;
        element.dataset.originalContent = originalContent;
        
        // Create textarea for editing
        const textarea = document.createElement('textarea');
        textarea.className = 'markleft-editing-mode';
        textarea.value = originalContent;
        textarea.rows = Math.max(3, originalContent.split('\\n').length);
        
        // Replace element content
        element.innerHTML = '';
        element.appendChild(textarea);
        element.classList.add('markleft-editing');
        
        // Focus and select text
        textarea.focus();
        textarea.select();
        
        // Set up event listeners for this edit session
        textarea.addEventListener('blur', () => exitEditMode(element));
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                exitEditMode(element, true); // Cancel editing
            } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                exitEditMode(element); // Save and exit
            }
        });
        
        editorState.currentEditingElement = element;
    }

    function exitEditMode(element, cancel = false) {
        const textarea = element.querySelector('.markleft-editing-mode');
        if (!textarea) return;
        
        let newContent;
        if (cancel) {
            newContent = element.dataset.originalContent;
        } else {
            newContent = textarea.value;
            // Send update to extension
            vscode.postMessage({
                type: 'edit',
                text: newContent,
                elementId: element.dataset.elementId
            });
        }
        
        // Restore element content (simplified - would need proper markdown parsing)
        element.innerHTML = newContent;
        element.classList.remove('markleft-editing');
        
        if (editorState.currentEditingElement === element) {
            editorState.currentEditingElement = null;
        }
    }

    function handleKeyboardShortcuts(event) {
        // Toggle frontmatter (Ctrl+Shift+M)
        if (event.ctrlKey && event.shiftKey && event.key === 'M') {
            event.preventDefault();
            toggleFrontmatter();
        }
        
        // Toggle TOC (Ctrl+Shift+T)
        if (event.ctrlKey && event.shiftKey && event.key === 'T') {
            event.preventDefault();
            toggleTableOfContents();
        }
        
        // Toggle mode (Ctrl+Shift+P)
        if (event.ctrlKey && event.shiftKey && event.key === 'P') {
            event.preventDefault();
            toggleMode();
        }
    }

    function initializeTableOfContents() {
        const tocElement = document.getElementById('toc');
        const tocList = document.getElementById('toc-list');
        const depthSlider = document.getElementById('toc-depth');
        
        if (!tocElement || !tocList || !depthSlider) return;
        
        // Set up depth slider
        depthSlider.addEventListener('input', updateTableOfContents);
        
        // Generate TOC
        updateTableOfContents();
    }

    function updateTableOfContents() {
        const tocList = document.getElementById('toc-list');
        const depthSlider = document.getElementById('toc-depth');
        
        if (!tocList || !depthSlider) return;
        
        const maxDepth = parseInt(depthSlider.value);
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        
        tocList.innerHTML = '';
        
        headings.forEach((heading, index) => {
            const level = parseInt(heading.tagName.substring(1));
            if (level <= maxDepth) {
                const tocItem = createTocItem(heading, level, index);
                tocList.appendChild(tocItem);
            }
        });
    }

    function createTocItem(heading, level, index) {
        const item = document.createElement('div');
        item.className = `markleft-toc-item level-${level}`;
        item.textContent = heading.textContent;
        item.dataset.headingId = `heading-${index}`;
        
        // Add ID to heading for navigation
        heading.id = `heading-${index}`;
        
        return item;
    }

    function scrollToHeading(headingId) {
        const heading = document.getElementById(headingId);
        if (heading) {
            heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    function toggleTableOfContents() {
        const tocElement = document.getElementById('toc');
        if (tocElement) {
            tocElement.classList.toggle('hidden');
            editorState.tocVisible = !tocElement.classList.contains('hidden');
        }
    }

    function initializeFrontmatter() {
        const frontmatterElements = document.querySelectorAll('.markleft-frontmatter');
        frontmatterElements.forEach(element => {
            if (editorState.frontmatterCollapsed) {
                element.classList.add('collapsed');
                // Count properties for display
                const content = element.querySelector('.markleft-frontmatter-content');
                if (content) {
                    const lines = content.textContent.trim().split('\\n').filter(line => line.includes(':'));
                    element.dataset.properties = lines.length;
                }
            }
        });
    }

    function toggleFrontmatter() {
        const frontmatterElements = document.querySelectorAll('.markleft-frontmatter');
        frontmatterElements.forEach(element => {
            element.classList.toggle('collapsed');
        });
        editorState.frontmatterCollapsed = !editorState.frontmatterCollapsed;
    }

    function initializeSelectiveEditing() {
        // Add editable classes to appropriate elements
        const editableSelectors = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'li', 'blockquote'];
        editableSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach((element, index) => {
                element.classList.add('markleft-editable');
                element.dataset.elementId = `${selector}-${index}`;
            });
        });
    }

    function toggleMode() {
        const modes = ['selective', 'source', 'preview'];
        const currentIndex = modes.indexOf(editorState.currentMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        editorState.currentMode = modes[nextIndex];
        
        // Apply mode changes
        applyMode();
        
        // Notify extension
        vscode.postMessage({
            type: 'modeChange',
            mode: editorState.currentMode
        });
    }

    function applyMode() {
        const body = document.body;
        body.className = body.className.replace(/markleft-mode-\\w+/g, '');
        body.classList.add(`markleft-mode-${editorState.currentMode}`);
    }

    function handleWindowResize() {
        // Adjust TOC position on mobile
        const tocElement = document.getElementById('toc');
        if (tocElement && window.innerWidth <= 768) {
            tocElement.style.position = 'absolute';
        } else if (tocElement) {
            tocElement.style.position = 'fixed';
        }
    }

    function handleScroll() {
        updateActiveTocItem();
    }

    function updateActiveTocItem() {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        const tocItems = document.querySelectorAll('.markleft-toc-item');
        
        let activeHeading = null;
        const scrollTop = window.pageYOffset;
        
        // Find the currently visible heading
        for (let i = headings.length - 1; i >= 0; i--) {
            const heading = headings[i];
            if (heading.offsetTop <= scrollTop + 100) {
                activeHeading = heading;
                break;
            }
        }
        
        // Update TOC active state
        tocItems.forEach(item => item.classList.remove('active'));
        if (activeHeading) {
            const activeItem = document.querySelector(`[data-heading-id="${activeHeading.id}"]`);
            if (activeItem) {
                activeItem.classList.add('active');
            }
        }
    }

    function applyConfiguration() {
        // This will be called when configuration changes
        // For now, just apply basic settings
        applyMode();
        
        if (editorState.tocVisible) {
            toggleTableOfContents();
        }
    }

    // Math rendering (if KaTeX is available)
    function renderMath() {
        if (typeof katex !== 'undefined') {
            // Render inline math
            const inlineMath = document.querySelectorAll('.markleft-math-inline');
            inlineMath.forEach(element => {
                try {
                    const latex = element.textContent;
                    katex.render(latex, element, { displayMode: false });
                } catch (error) {
                    console.error('KaTeX inline rendering error:', error);
                }
            });
            
            // Render block math
            const blockMath = document.querySelectorAll('.markleft-math-block');
            blockMath.forEach(element => {
                try {
                    const latex = element.textContent;
                    katex.render(latex, element, { displayMode: true });
                } catch (error) {
                    console.error('KaTeX block rendering error:', error);
                }
            });
        }
    }

    // Export for extension communication
    window.markLeftEditor = {
        state: editorState,
        toggleMode,
        toggleTableOfContents,
        toggleFrontmatter,
        renderMath,
        updateTableOfContents
    };

})();