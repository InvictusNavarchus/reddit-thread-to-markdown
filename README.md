# Reddit Thread to Markdown Scraper

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MPL--2.0-green.svg)

A Tampermonkey/Greasemonkey userscript that allows you to scrape Reddit threads and download them as formatted Markdown files with a single click.

## Features

- 📜 **One-click scraping** - Adds a convenient "Scrape to Markdown" button to Reddit threads
- 🔧 **Complete thread capture** - Extracts post content, metadata, and all comments with proper nesting
- 📝 **Markdown formatting** - Outputs clean, readable Markdown with proper indentation and formatting
- 🐛 **Verbose logging** - Comprehensive console logging for debugging and monitoring
- 🎯 **Smart filename generation** - Automatically generates safe filenames based on thread titles
- ⚡ **Lightweight and fast** - Minimal resource usage with efficient DOM traversal

## Installation

1. Install a userscript manager:
   - [Tampermonkey](https://www.tampermonkey.net/) (Recommended)
   - [Greasemonkey](https://www.greasespot.net/)
   - [Violentmonkey](https://violentmonkey.github.io/)

2. Copy the userscript code and create a new script in your userscript manager

3. Save and enable the script

## Usage

1. Navigate to any Reddit thread (e.g., `https://www.reddit.com/r/example/comments/...`)
2. Wait for the page to fully load
3. Look for the **"Scrape to Markdown"** button in the thread's credit bar
4. Click the button to download the thread as a Markdown file

## Output Format

The generated Markdown file includes:

- **Thread metadata** (title, author, subreddit, score)
- **Post content** (if present)
- **Hierarchical comments** with proper indentation
- **Comment metadata** (author, score)

### Example Output Structure

```markdown
# Thread Title

**Subreddit:** r/example
**Author:** u/username
**Score:** 123

Post content goes here...

---

## Comments

- **u/commenter1** (*45 points*):
  > This is a top-level comment.

    - **u/commenter2** (*12 points*):
      > This is a nested reply.
```

## Technical Details

- **Target Sites:** Reddit threads (`https://www.reddit.com/r/*/comments/*`)
- **Dependencies:** None (pure JavaScript)
- **Browser Compatibility:** Modern browsers with userscript manager support
- **Architecture:** Modular design with separate utilities for logging, DOM manipulation, file operations, and data extraction

## Contributing

Feel free to submit issues and enhancement requests. 

## License

This project is licensed under the Mozilla Public License 2.0 - see the [LICENSE](LICENSE) file for details.
