(function () {
  "use strict";

  // Get the VS Code API
  const vscode = acquireVsCodeApi();

  // DOM elements
  const editor = document.getElementById("markdown-editor");
  const preview = document.getElementById("markdown-preview");
  const previewPane = document.getElementById("preview-pane");
  const editorPane = document.getElementById("editor-pane");
  const overlayContainer = document.getElementById("overlay-container");

  // Toolbar buttons
  const togglePreviewBtn = document.getElementById("toggle-preview");
  const insertTableBtn = document.getElementById("insert-table");
  const insertLinkBtn = document.getElementById("insert-link");
  const focusModeBtn = document.getElementById("focus-mode");
  const insertMathBtn = document.getElementById("insert-math");
  const insertDiagramBtn = document.getElementById("insert-diagram");

  // State
  let currentText = "";
  let previewVisible = true;
  let focusMode = "off";
  let editorLineHeight = 20;
  let editorPaddingLeft = 0;

  // Selective editing state
  let editRegions = new Map(); // Maps region IDs to {start, end, type, element}
  let nextRegionId = 1;
  let isSelectiveEditingEnabled = true;

  // Initialize
  init();

  function init() {
    setupEventListeners();
    setupMermaid();
    measureEditorMetrics();
    enableSelectiveEditing(); // Enable selective editing by default
    requestInitialContent();
  }

  function setupEventListeners() {
    // Editor events
    editor.addEventListener("input", onEditorInput);
    editor.addEventListener("scroll", onEditorScroll);
    editor.addEventListener("keydown", onEditorKeyDown);
    editor.addEventListener("keyup", updateOverlayVisibilityForCaret);
    editor.addEventListener("click", updateOverlayVisibilityForCaret);
    editor.addEventListener("select", updateOverlayVisibilityForCaret);
    editor.addEventListener("focus", updateOverlayVisibilityForCaret);
    editor.addEventListener("blur", () => setOverlayVisibility(true));

    // Toolbar events
    togglePreviewBtn.addEventListener("click", togglePreview);
    insertTableBtn.addEventListener("click", insertTable);
    insertLinkBtn.addEventListener("click", insertWikiLink);
    focusModeBtn.addEventListener("click", toggleFocusMode);
    insertMathBtn.addEventListener("click", insertMath);
    insertDiagramBtn.addEventListener("click", insertDiagram);

    // VS Code messages
    window.addEventListener("message", onVSCodeMessage);

    // Preview click events
    preview.addEventListener("click", onPreviewClick);

    window.addEventListener("resize", onWindowResize);
  }

  function setupMermaid() {
    // Initialize Mermaid for diagram rendering
    if (typeof mermaid !== "undefined") {
      mermaid.initialize({
        startOnLoad: false,
        theme: "dark",
        themeVariables: {
          primaryColor: "#007acc",
          primaryTextColor: "#cccccc",
          primaryBorderColor: "#3e3e42",
          lineColor: "#969696",
          sectionBkgColor: "#252526",
          altSectionBkgColor: "#1e1e1e",
          gridColor: "#3e3e42",
          secondaryColor: "#2d2d30",
          tertiaryColor: "#1e1e1e",
        },
      });
    }
  }

  function onEditorInput() {
    const text = editor.value;
    currentText = text;

    // Send update to VS Code
    vscode.postMessage({
      type: "edit",
      text: text,
    });

    // Update preview
    if (previewVisible) {
      updatePreview(text);
    }

    measureEditorMetrics();
    updateOverlayVisibilityForCaret();
  }

  function onEditorScroll() {
    // Sync scroll between editor and preview
    if (previewVisible) {
      const scrollPercent =
        editor.scrollTop / (editor.scrollHeight - editor.clientHeight);
      preview.scrollTop =
        scrollPercent * (preview.scrollHeight - preview.clientHeight);
    }

    positionOverlays();
  }

  function onEditorKeyDown(event) {
    // Handle special key combinations
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case "b":
          event.preventDefault();
          insertFormatting("**", "**", "bold text");
          break;
        case "i":
          event.preventDefault();
          insertFormatting("*", "*", "italic text");
          break;
        case "k":
          event.preventDefault();
          insertWikiLink();
          break;
      }
    }

    // Handle Tab key for indentation
    if (event.key === "Tab") {
      event.preventDefault();
      const start = editor.selectionStart;
      const end = editor.selectionEnd;

      if (event.shiftKey) {
        // Shift+Tab: Remove indentation
        unindentText(start, end);
      } else {
        // Tab: Add indentation
        insertText("  ", start, end);
      }
    }
  }

  function onWindowResize() {
    measureEditorMetrics();
    positionOverlays();
  }

  function onVSCodeMessage(event) {
    const message = event.data;

    switch (message.type) {
      case "update":
        if (message.text !== currentText) {
          currentText = message.text;
          editor.value = message.text;
          if (previewVisible && !message.html) {
            updatePreview(message.text);
          }
        }
        if (message.html) {
          renderPreviewHtml(message.html);
        } else if (previewVisible) {
          updatePreview(message.text);
        }
        break;
      case "togglePreview":
        togglePreview();
        break;
      case "updateOverlays":
        updateOverlays(message.overlays);
        break;
      case "positionUpdate":
        positionOverlays();
        break;
      case "setVisibility":
        setOverlayVisibility(message.visible);
        break;
    }
  }

  function onPreviewClick(event) {
    // Handle wiki-link clicks
    if (event.target.classList.contains("wiki-link")) {
      event.preventDefault();
      const linkText = event.target.getAttribute("data-link");

      vscode.postMessage({
        type: "openWikiLink",
        link: linkText,
      });
    }
  }

  function requestInitialContent() {
    vscode.postMessage({ type: "requestContent" });
  }

  function updatePreview(text) {
    // Fallback inline renderer used while we wait for the extension to send
    // the fully rendered HTML. Good enough for fast feedback.
    let html = text;

    html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");
    html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");
    html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");
    html = html.replace(/\*\*(.*)\*\*/gim, "<strong>$1</strong>");
    html = html.replace(/\*(.*)\*/gim, "<em>$1</em>");
    html = html.replace(
      /\[\[([^\]]+)\]\]/gim,
      '<a href="#" class="wiki-link" data-link="$1">$1</a>'
    );
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/gim, (match, lang, code) => {
      if (lang === "mermaid") {
        return `<div class="mermaid-container"><div class="mermaid">${code}</div></div>`;
      }
      return `<pre class="code-block"><code class="language-${
        lang || "text"
      }">${escapeHtml(code)}</code></pre>`;
    });
    html = html.replace(/`([^`]+)`/gim, "<code>$1</code>");
    html = html.replace(/\n/gim, "<br>");

    renderPreviewHtml(
      `<div class="markdown-content" data-focus-mode="${focusMode}">${html}</div>`
    );
  }

  function renderPreviewHtml(html) {
    if (typeof html !== "string") {
      return;
    }
    preview.innerHTML = html;
    renderMermaidInPreview();
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function togglePreview() {
    previewVisible = !previewVisible;

    if (previewVisible) {
      previewPane.style.display = "flex";
      editorPane.style.borderRight = "1px solid var(--border-color)";
      togglePreviewBtn.classList.add("active");
      updatePreview(currentText);
    } else {
      previewPane.style.display = "none";
      editorPane.style.borderRight = "none";
      togglePreviewBtn.classList.remove("active");
    }
  }

  function insertTable() {
    const tableText = `\n| Column 1 | Column 2 | Column 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n| Cell 4   | Cell 5   | Cell 6   |\n`;
    insertTextAtCursor(tableText);
  }

  function insertWikiLink() {
    const selectedText = getSelectedText();
    const linkText = selectedText || "Link Text";
    insertFormatting("[[", "]]", linkText);
  }

  function toggleFocusMode() {
    const modes = ["off", "paragraph", "section"];
    const currentIndex = modes.indexOf(focusMode);
    focusMode = modes[(currentIndex + 1) % modes.length];

    focusModeBtn.classList.toggle("active", focusMode !== "off");

    if (previewVisible) {
      updatePreview(currentText);
    }

    // Send focus mode change to VS Code
    vscode.postMessage({
      type: "focusModeChange",
      mode: focusMode,
    });
  }

  function insertMath() {
    const selectedText = getSelectedText();
    const isBlock = selectedText.includes("\n") || selectedText.length > 20;

    if (isBlock) {
      insertFormatting("$$\n", "\n$$", selectedText || "E = mc^2");
    } else {
      insertFormatting("$", "$", selectedText || "E = mc^2");
    }
  }

  function insertDiagram() {
    const diagramText = `\n\`\`\`mermaid\ngraph TD\n    A[Start] --> B{Is it?}\n    B -->|Yes| C[OK]\n    B -->|No| D[End]\n\`\`\`\n`;
    insertTextAtCursor(diagramText);
  }

  function insertFormatting(prefix, suffix, defaultText) {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selectedText = editor.value.substring(start, end);
    const text = selectedText || defaultText;

    const newText = prefix + text + suffix;
    insertText(newText, start, end);

    // Set cursor position
    const newCursorPos = start + prefix.length;
    editor.setSelectionRange(newCursorPos, newCursorPos + text.length);
    editor.focus();
  }

  function insertTextAtCursor(text) {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    insertText(text, start, end);

    const newCursorPos = start + text.length;
    editor.setSelectionRange(newCursorPos, newCursorPos);
    editor.focus();
  }

  function insertText(text, start, end) {
    const before = editor.value.substring(0, start);
    const after = editor.value.substring(end);

    editor.value = before + text + after;
    currentText = editor.value;

    // Trigger input event
    const event = new Event("input", { bubbles: true });
    editor.dispatchEvent(event);
  }

  function getSelectedText() {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    return editor.value.substring(start, end);
  }

  function unindentText(start, end) {
    const lines = editor.value.split("\n");
    const startLine = editor.value.substring(0, start).split("\n").length - 1;
    const endLine = editor.value.substring(0, end).split("\n").length - 1;

    for (let i = startLine; i <= endLine; i++) {
      if (lines[i].startsWith("  ")) {
        lines[i] = lines[i].substring(2);
      }
    }

    const newText = lines.join("\n");
    editor.value = newText;
    currentText = newText;

    // Trigger input event
    const event = new Event("input", { bubbles: true });
    editor.dispatchEvent(event);
  }

  // Selective Editing Functions
  function enableSelectiveEditing() {
    isSelectiveEditingEnabled = true;
    preview.addEventListener("click", onPreviewElementClick);
    updatePreview(currentText); // Re-render with selective editing enabled
  }

  function disableSelectiveEditing() {
    isSelectiveEditingEnabled = false;
    preview.removeEventListener("click", onPreviewElementClick);
    clearAllEditRegions();
    updatePreview(currentText); // Re-render without selective editing
  }

  function onPreviewElementClick(event) {
    if (!isSelectiveEditingEnabled) return;

    // Don't handle clicks on interactive elements
    if (
      event.target.tagName === "A" ||
      event.target.classList.contains("wiki-link")
    ) {
      return;
    }

    event.preventDefault();

    // Find the clicked element and determine what to edit
    const clickedElement = event.target;
    const region = determineEditRegion(clickedElement);

    if (region) {
      toggleEditRegion(region);
    }
  }

  function determineEditRegion(element) {
    // Walk up the DOM to find the most appropriate editable region
    let currentElement = element;

    // Look for block-level elements first (highest priority)
    while (currentElement && currentElement !== preview) {
      if (isBlockLevelElement(currentElement)) {
        return createRegionFromElement(currentElement, "block");
      }
      currentElement = currentElement.parentElement;
    }

    // If no block element found, try line-level
    currentElement = element;
    while (currentElement && currentElement !== preview) {
      if (isLineLevelElement(currentElement)) {
        return createRegionFromElement(currentElement, "line");
      }
      currentElement = currentElement.parentElement;
    }

    // Finally, try word-level
    if (element.textContent && element.textContent.trim()) {
      return createRegionFromElement(element, "word");
    }

    return null;
  }

  function isBlockLevelElement(element) {
    const blockTags = [
      "H1",
      "H2",
      "H3",
      "H4",
      "H5",
      "H6",
      "P",
      "LI",
      "BLOCKQUOTE",
      "PRE",
    ];
    return (
      blockTags.includes(element.tagName) ||
      element.classList.contains("code-block") ||
      element.classList.contains("mermaid-container")
    );
  }

  function isLineLevelElement(element) {
    // For now, treat any text-containing element as line-level
    return (
      element.textContent &&
      element.textContent.trim() &&
      element.children.length === 0
    );
  }

  function createRegionFromElement(element, type) {
    // Get the approximate source position for this element
    const sourcePosition = getSourcePositionFromElement(element);

    if (!sourcePosition) return null;

    return {
      id: nextRegionId++,
      element: element,
      type: type,
      start: sourcePosition.start,
      end: sourcePosition.end,
      source: getSourceText(sourcePosition.start, sourcePosition.end),
    };
  }

  function getSourcePositionFromElement(element) {
    // This is a simplified mapping - in a real implementation, we'd need
    // more sophisticated position mapping between rendered HTML and source
    const elementIndex = Array.from(preview.querySelectorAll("*")).indexOf(
      element
    );

    if (elementIndex === -1) return null;

    // Estimate source positions based on element position in document
    // This is a rough approximation - real implementation would need AST parsing
    const lines = currentText.split("\n");
    const estimatedLine = Math.floor(
      (elementIndex / preview.querySelectorAll("*").length) * lines.length
    );

    return {
      start: Math.max(0, estimatedLine),
      end: Math.min(lines.length - 1, estimatedLine + 2),
    };
  }

  function getSourceText(startLine, endLine) {
    const lines = currentText.split("\n");
    return lines.slice(startLine, endLine + 1).join("\n");
  }

  function toggleEditRegion(region) {
    if (editRegions.has(region.id)) {
      // Region is already in edit mode, switch back to preview
      removeEditRegion(region.id);
    } else {
      // Switch region to edit mode
      addEditRegion(region);
    }
  }

  function addEditRegion(region) {
    editRegions.set(region.id, region);

    // Create an inline editor for this region
    const editorElement = createInlineEditor(region);
    region.element.replaceWith(editorElement);

    // Focus the new editor
    setTimeout(() => {
      editorElement.focus();
      editorElement.select();
    }, 10);
  }

  function removeEditRegion(regionId) {
    const region = editRegions.get(regionId);
    if (!region) return;

    // Replace the editor with rendered content
    const renderedElement = createRenderedElement(region);
    region.element.replaceWith(renderedElement);

    editRegions.delete(regionId);
  }

  function createInlineEditor(region) {
    const textarea = document.createElement("textarea");
    textarea.className = "inline-editor";
    textarea.value = region.source;
    textarea.dataset.regionId = region.id;

    // Position the textarea to match the original element
    const rect = region.element.getBoundingClientRect();
    textarea.style.position = "absolute";
    textarea.style.left = rect.left + "px";
    textarea.style.top = rect.top + "px";
    textarea.style.width = rect.width + "px";
    textarea.style.minHeight = rect.height + "px";

    // Event listeners
    textarea.addEventListener("blur", () =>
      handleInlineEditorBlur(region.id, textarea)
    );
    textarea.addEventListener("keydown", (e) =>
      handleInlineEditorKeydown(e, region.id, textarea)
    );

    return textarea;
  }

  function createRenderedElement(region) {
    // Re-render the source text as HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = renderMarkdownToHtml(region.source);
    return tempDiv.firstElementChild || tempDiv;
  }

  function renderMarkdownToHtml(text) {
    // Simple markdown rendering (reuse existing logic)
    let html = text;

    // Headers
    html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");
    html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");
    html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");

    // Bold and italic
    html = html.replace(/\*\*(.*)\*\*/gim, "<strong>$1</strong>");
    html = html.replace(/\*(.*)\*/gim, "<em>$1</em>");

    // Wiki links
    html = html.replace(
      /\[\[([^\]]+)\]\]/gim,
      '<a href="#" class="wiki-link" data-link="$1">$1</a>'
    );

    // Line breaks
    html = html.replace(/\n/gim, "<br>");

    return html;
  }

  function handleInlineEditorBlur(regionId, textarea) {
    const newSource = textarea.value;
    updateRegionSource(regionId, newSource);
    removeEditRegion(regionId);
  }

  function handleInlineEditorKeydown(event, regionId, textarea) {
    if (event.key === "Escape") {
      // Cancel editing
      removeEditRegion(regionId);
    } else if (event.key === "Enter" && event.ctrlKey) {
      // Save and exit
      handleInlineEditorBlur(regionId, textarea);
    }
  }

  function updateRegionSource(regionId, newSource) {
    const region = editRegions.get(regionId);
    if (!region) return;

    // Update the source text
    region.source = newSource;

    // Update the main document
    const lines = currentText.split("\n");
    // This is simplified - real implementation would need proper source mapping
    lines.splice(
      region.start,
      region.end - region.start + 1,
      ...newSource.split("\n")
    );
    currentText = lines.join("\n");

    // Update the main editor
    editor.value = currentText;

    // Notify VS Code of the change
    vscode.postMessage({
      type: "edit",
      text: currentText,
    });
  }

  function clearAllEditRegions() {
    for (const regionId of editRegions.keys()) {
      removeEditRegion(regionId);
    }
  }

  // Export for debugging
  window.markrightEditor = {
    togglePreview,
    insertTable,
    insertWikiLink,
    toggleFocusMode,
    insertMath,
    insertDiagram,
  };

  // Overlay functionality
  let currentOverlays = [];
  let overlayVisibility = true;

  function updateOverlays(overlays) {
    currentOverlays = Array.isArray(overlays) ? overlays : [];
    measureEditorMetrics();
    renderOverlays();
    updateOverlayVisibilityForCaret();
  }

  function setOverlayVisibility(visible) {
    overlayVisibility = visible;
    if (overlayContainer) {
      overlayContainer.style.display = visible ? "block" : "none";
      if (visible) {
        positionOverlays();
      }
    }
    applyOverlayEditorStyles();
  }

  function renderOverlays() {
    const overlayContainer = document.getElementById("overlay-container");
    if (!overlayContainer) return;

    // Clear existing overlays
    overlayContainer.innerHTML = "";

    if (!overlayVisibility) {
      applyOverlayEditorStyles();
      return;
    }

    currentOverlays.forEach((overlay, index) => {
      const overlayElement = createOverlayElement(overlay, index);
      if (overlayElement) {
        overlayContainer.appendChild(overlayElement);
        if (overlay.type === "diagram") {
          const diagramSource = overlay.rendered || overlay.content || "";
          renderMermaidOverlay(overlayElement, diagramSource, index);
        }
      }
    });

    positionOverlays();
    applyOverlayEditorStyles();
  }

  function createOverlayElement(overlay, index) {
    if (!overlay || !overlay.range || typeof overlay.range.start !== "object") {
      return null;
    }

    const element = document.createElement("div");
    element.className = `floating-overlay ${overlay.type}`;
    element.dataset.type = overlay.type;
    element.dataset.index = String(index);

    const startLine = overlay.range.start?.line ?? 0;
    const endLine = overlay.range.end?.line ?? startLine;
    element.dataset.startLine = String(startLine);
    element.dataset.endLine = String(endLine);

    if (overlay.type === "heading" && overlay.level) {
      element.classList.add("heading");
      element.classList.add(`h${overlay.level}`);
      element.textContent = overlay.rendered || overlay.content || "";
      const sizes = {
        1: { fontSize: "26px", fontWeight: 700 },
        2: { fontSize: "22px", fontWeight: 700 },
        3: { fontSize: "19px", fontWeight: 600 },
        4: { fontSize: "17px", fontWeight: 600 },
        5: { fontSize: "15px", fontWeight: 600 },
        6: { fontSize: "14px", fontWeight: 600 },
      };
      const styling = sizes[overlay.level] || sizes[1];
      element.style.fontSize = styling.fontSize;
      element.style.fontWeight = styling.fontWeight;
      element.style.background = "transparent";
      element.style.boxShadow = "none";
      element.style.padding = "0";
    } else if (overlay.type === "table") {
      element.innerHTML = overlay.rendered || "";
    } else if (overlay.type === "latex") {
      element.innerHTML = `<div class="latex">${overlay.rendered || overlay.content || ""}</div>`;
    } else if (overlay.type === "diagram") {
      element.classList.add("diagram");
      element.innerHTML = `<div class="mermaid" data-mermaid-index="${index}">${
        overlay.rendered || overlay.content || ""
      }</div>`;
    }

    return element;
  }

  function renderMermaidOverlay(container, code, index) {
    if (typeof mermaid === "undefined") {
      container.innerHTML = `<pre class="mermaid">${escapeHtml(code)}</pre>`;
      return;
    }

    const renderId = `markright-overlay-${Date.now()}-${index}`;
    const targetNode = container.querySelector(".mermaid");
    if (!targetNode) {
      container.innerHTML = `<pre class="mermaid">${escapeHtml(code)}</pre>`;
      return;
    }

    try {
      mermaid
        .render(renderId, code)
        .then(({ svg }) => {
          targetNode.innerHTML = svg;
          positionOverlays();
        })
        .catch((error) => {
          console.error("Mermaid overlay render error", error);
          container.innerHTML = `<pre class="mermaid">${escapeHtml(code)}</pre>`;
        });
    } catch (error) {
      console.error("Mermaid overlay render error", error);
      container.innerHTML = `<pre class="mermaid">${escapeHtml(code)}</pre>`;
    }
  }

  function positionOverlays() {
    if (!overlayContainer || !editor || !overlayVisibility) {
      return;
    }

    overlayContainer.style.height = `${editor.scrollHeight}px`;
    overlayContainer.style.width = `${editor.clientWidth}px`;

    const scrollTop = editor.scrollTop;
    const viewHeight = editor.clientHeight;
    const lineHeight = editorLineHeight || 20;
    const visibleStart = Math.floor(scrollTop / lineHeight);
    const visibleEnd = Math.ceil((scrollTop + viewHeight) / lineHeight);

    overlayContainer.querySelectorAll(".floating-overlay").forEach((element) => {
      const startLine = parseInt(element.dataset.startLine || "0", 10);
      const endLine = parseInt(element.dataset.endLine || String(startLine), 10);

      if (endLine < visibleStart || startLine > visibleEnd) {
        element.classList.add("hidden");
        return;
      }

      element.classList.remove("hidden");

      const offsetTop = startLine * lineHeight - scrollTop;
      element.style.top = `${offsetTop}px`;
      element.style.left = `${editorPaddingLeft}px`;
    });
  }

  function measureEditorMetrics() {
    if (!editor || !overlayContainer) {
      return;
    }

    const style = window.getComputedStyle(editor);
    const lineHeight = parseFloat(style.lineHeight);
    editorLineHeight = Number.isFinite(lineHeight) ? lineHeight : 20;
    editorPaddingLeft = parseFloat(style.paddingLeft) || 0;

    overlayContainer.style.width = `${editor.clientWidth}px`;
    overlayContainer.style.height = `${editor.scrollHeight}px`;
  }

  function applyOverlayEditorStyles() {
    if (!editor) {
      return;
    }

    const shouldHideSource = overlayVisibility && currentOverlays.length > 0;
    editor.classList.toggle("overlay-active", shouldHideSource);
  }

  function updateOverlayVisibilityForCaret() {
    if (!editor) {
      return;
    }

    if (!currentOverlays.length) {
      applyOverlayEditorStyles();
      return;
    }

    const caretLine = getCaretLine();
    if (caretLine === null) {
      return;
    }

    const caretInsideOverlay = currentOverlays.some((overlay) => {
      if (!overlay || !overlay.range || !overlay.range.start) {
        return false;
      }
      const startLine = overlay.range.start.line ?? 0;
      const endLine = overlay.range.end?.line ?? startLine;
      return caretLine >= startLine && caretLine <= endLine;
    });

    if (caretInsideOverlay) {
      if (overlayVisibility) {
        setOverlayVisibility(false);
      }
    } else if (!overlayVisibility) {
      setOverlayVisibility(true);
    }
  }

  function getCaretLine() {
    if (!editor || typeof editor.selectionStart !== "number") {
      return null;
    }

    const beforeCaret = editor.value.slice(0, editor.selectionStart);
    return beforeCaret.split("\n").length - 1;
  }

  function renderMermaidInPreview() {
    if (typeof mermaid === "undefined") {
      return;
    }

    const nodes = preview.querySelectorAll(
      ".mermaid:not([data-processed])"
    );
    nodes.forEach((node, index) => {
      const code = node.textContent;
      if (!code) {
        return;
      }
      const renderId = `markright-preview-${Date.now()}-${index}`;
      try {
        mermaid
          .render(renderId, code)
          .then(({ svg }) => {
            node.innerHTML = svg;
            node.setAttribute("data-processed", "true");
          })
          .catch((error) => {
            console.error("Mermaid preview render error", error);
            node.innerHTML = `<pre class="mermaid">${escapeHtml(code)}</pre>`;
          });
      } catch (error) {
        console.error("Mermaid preview render error", error);
        node.innerHTML = `<pre class="mermaid">${escapeHtml(code)}</pre>`;
      }
    });
  }
})();
