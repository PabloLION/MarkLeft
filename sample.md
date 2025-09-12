# Sample Markdown Document

This is a sample markdown document to test the MarkLeft WYSIWYG editor.

## Features to Test

### 1. Selective Editing
Click on any paragraph or heading to edit it directly while keeping the rest in preview mode.

### 2. Typography Hierarchy
Different heading levels should have appropriate line heights:

# Heading 1 (H1)
## Heading 2 (H2)  
### Heading 3 (H3)
#### Heading 4 (H4)
##### Heading 5 (H5)
###### Heading 6 (H6)

### 3. Lists
- First level bullet
  - Second level bullet
    - Third level bullet
      - Fourth level bullet

1. Numbered list item 1
2. Numbered list item 2
   - Nested bullet in numbered list
   - Another nested bullet

### 4. LaTeX Math (To be implemented)
Inline math: $E = mc^2$

Block math:
$$
\frac{d}{dx}f(x) = \lim_{h \to 0} \frac{f(x+h) - f(x)}{h}
$$

### 5. Tables
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Row 1, Col 1 | Row 1, Col 2 | Row 1, Col 3 |
| Row 2, Col 1 | Row 2, Col 2 | Row 2, Col 3 |

### 6. Code Blocks
```javascript
function hello() {
    console.log("Hello, MarkLeft!");
}
```

### 7. Links and Formatting
This is **bold text** and this is *italic text*.

Here's a [link to GitHub](https://github.com).

> This is a blockquote to test styling.

---

## Frontmatter Example
```yaml
---
title: "Sample Document"
author: "MarkLeft"
date: "2024-01-01"
tags: ["markdown", "wysiwyg", "editor"]
---
```

## TODO List
- [ ] Implement LaTeX rendering
- [x] Basic selective editing
- [ ] Enhanced table editing
- [ ] Diagram support
- [x] Table of contents