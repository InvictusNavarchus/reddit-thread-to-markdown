// ==UserScript==
// @name         Reddit Thread to Markdown Scraper
// @namespace    http://tampermonkey.net/
// @version      0.1.0
// @description  Scrapes a Reddit thread and downloads it as a formatted Markdown file with verbose logging.
// @author       Invictus Navarchus
// @match        https://www.reddit.com/r/*/comments/*
// @grant        GM_download
// @run-at       document-idle
// ==/UserScript==

(function () {
	"use strict";

	// ========================================
	// UTILITY MODULES
	// ========================================

	/**
	 * Logging utilities for consistent output formatting
	 */
	const Logger = {
		/**
		 * Creates a standardized log prefix with a title, emoji, and timestamp.
		 * @returns {string} The formatted log prefix.
		 */
		getPrefix() {
			const title = "Reddit Scraper";
			const emoji = "📜";
			const now = new Date();
			const timestamp = now.toTimeString().slice(0, 8);
			return `${title} ${emoji} [${timestamp}]:`;
		},

		/**
		 * Logs a message with the standard prefix
		 * @param {...any} args - Arguments to log
		 */
		log(...args) {
			console.log(this.getPrefix(), ...args);
		},

		/**
		 * Logs a warning with the standard prefix
		 * @param {...any} args - Arguments to log
		 */
		warn(...args) {
			console.warn(this.getPrefix(), ...args);
		},

		/**
		 * Logs an error with the standard prefix
		 * @param {...any} args - Arguments to log
		 */
		error(...args) {
			console.error(this.getPrefix(), ...args);
		},

		/**
		 * Logs verbose debug information with the standard prefix
		 * @param {...any} args - Arguments to log
		 */
		debug(...args) {
			console.dir(...args);
		}
	};

	/**
	 * DOM utilities for element selection and manipulation
	 */
	const DOMUtils = {
		/**
		 * Safely queries for an element and logs the result
		 * @param {string} selector - CSS selector
		 * @param {string} description - Description for logging
		 * @returns {HTMLElement|null} The found element or null
		 */
		querySelector(selector, description = "element") {
			const element = document.querySelector(selector);
			if (element) {
				Logger.log(`Found ${description}.`);
			} else {
				Logger.error(`Could not find ${description} with selector: ${selector}`);
			}
			return element;
		},

		/**
		 * Creates a styled button element
		 * @param {string} text - Button text
		 * @param {string} id - Button ID
		 * @param {Function} clickHandler - Click event handler
		 * @returns {HTMLElement} The created button element
		 */
		createStyledButton(text, id, clickHandler) {
			const button = document.createElement("button");
			button.textContent = text;
			button.id = id;
			button.style.marginLeft = "10px";
			button.style.padding = "5px 10px";
			button.style.border = "1px solid var(--color-neutral-border-weak)";
			button.style.borderRadius = "20px";
			button.style.cursor = "pointer";
			button.style.backgroundColor = "var(--color-neutral-background-weak)";
			button.style.color = "var(--color-neutral-content-weak)";
			button.addEventListener("click", clickHandler);
			return button;
		},

		/**
		 * Logs all attributes of an element for debugging
		 * @param {HTMLElement} element - Element to inspect
		 * @param {string} description - Description for logging
		 */
		logElementAttributes(element, description = "element") {
			Logger.log(`Inspecting ${description} attributes:`);
			const attrs = {};
			for (const attr of element.attributes) {
				attrs[attr.name] = attr.value;
			}
			Logger.debug(attrs);
		}
	};

	/**
	 * File utilities for download operations
	 */
	const FileUtils = {
		/**
		 * Generates a safe filename from the document title
		 * @returns {string} The sanitized filename
		 */
		generateFilename() {
			const threadTitle = document.title
				.replace(/ : r\/.*/, "")
				.replace(/[^a-z0-9]/gi, "_")
				.toLowerCase();
			return `${threadTitle}.md`;
		},

		/**
		 * Downloads content as a markdown file
		 * @param {string} content - Content to download
		 * @param {string} filename - Filename for the download
		 */
		downloadMarkdown(content, filename) {
			Logger.log("Creating Blob for download...");
			const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
			Logger.log("Blob created:", blob);
			
			const url = URL.createObjectURL(blob);
			Logger.log(`Object URL created: ${url}`);

			Logger.log("Initiating download via temporary anchor element...");
			const a = document.createElement("a");
			a.href = url;
			a.download = filename;
			document.body.appendChild(a);
			a.click();
			
			// Cleanup
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		}
	};

	/**
	 * Markdown formatting utilities
	 */
	const MarkdownUtils = {
		/**
		 * Formats post metadata as markdown
		 * @param {Object} postData - Post data object
		 * @returns {string} Formatted markdown
		 */
		formatPostHeader(postData) {
			let markdown = `# ${postData.title}\n\n`;
			markdown += `**Subreddit:** r/${postData.subreddit}\n`;
			markdown += `**Author:** u/${postData.author}\n`;
			markdown += `**Score:** ${postData.score}\n\n`;
			return markdown;
		},

		/**
		 * Formats a comment as markdown with proper indentation
		 * @param {Object} commentData - Comment data object
		 * @returns {string} Formatted markdown
		 */
		formatComment(commentData) {
			const { author, score, content, depth } = commentData;
			const indent = "  ".repeat(depth * 2);
			
			let markdown = `${indent}- **u/${author}** (*${score} points*):\n`;
			markdown += `${indent}  > ${content.replace(/\n/g, `\n${indent}  > `)}\n\n`;
			return markdown;
		}
	};

	// ========================================
	// DATA EXTRACTION MODULES
	// ========================================

	/**
	 * Reddit post data extraction utilities
	 */
	const PostExtractor = {
		/**
		 * Extracts post data from the main post element
		 * @param {HTMLElement} postElement - The shreddit-post element
		 * @returns {Object|null} Extracted post data or null if extraction fails
		 */
		extractPostData(postElement) {
			if (!postElement) {
				Logger.error("No post element provided for extraction.");
				return null;
			}

			DOMUtils.logElementAttributes(postElement, "shreddit-post element");

			const title = postElement.postTitle || postElement.getAttribute("post-title");
			const author = postElement.author || postElement.getAttribute("author");
			const subreddit = postElement.subredditName || postElement.getAttribute("subreddit-name");
			const score = postElement.score || postElement.getAttribute("score");

			Logger.log(`  - Title: ${title}`);
			Logger.log(`  - Author: u/${author}`);
			Logger.log(`  - Subreddit: r/${subreddit}`);
			Logger.log(`  - Score: ${score}`);

			const postBody = postElement.querySelector('[id$="-post-rtjson-content"]');
			let content = "";
			if (postBody) {
				content = postBody.innerText.trim();
				Logger.log(`  - Post body found with length: ${content.length}`);
			} else {
				Logger.warn("  - Post body content element not found.");
			}

			return { title, author, subreddit, score, content };
		}
	};

	/**
	 * Reddit comment data extraction utilities
	 */
	const CommentExtractor = {
		/**
		 * Extracts data from a single comment element
		 * @param {HTMLElement} commentElement - The shreddit-comment element
		 * @returns {Object|null} Extracted comment data or null if extraction fails
		 */
		extractCommentData(commentElement) {
			const depth = parseInt(commentElement.getAttribute("depth"), 10) || 0;
			const author = commentElement.getAttribute("author");
			const score = commentElement.getAttribute("score");
			const contentElement = commentElement.querySelector('[id$="-comment-rtjson-content"] > div');

			if (!author || !contentElement) {
				Logger.warn("Could not extract full details from a comment.", {
					author,
					contentElement: !!contentElement,
				});
				return null;
			}

			const content = contentElement.innerText.trim();
			return { author, score, content, depth };
		},

		/**
		 * Extracts data from all comments in the comment tree
		 * @returns {Array} Array of comment data objects
		 */
		extractAllComments() {
			const commentTree = DOMUtils.querySelector("shreddit-comment-tree", "comment tree");
			if (!commentTree) {
				return [];
			}

			const comments = commentTree.querySelectorAll("shreddit-comment");
			Logger.log(`  - Found ${comments.length} comment elements to process.`);

			const commentData = [];
			for (let i = 0; i < comments.length; i++) {
				Logger.log(`  - Processing comment ${i + 1} of ${comments.length}...`);
				const data = this.extractCommentData(comments[i]);
				if (data) {
					commentData.push(data);
				}
			}

			return commentData;
		}
	};

	// ========================================
	// MAIN APPLICATION LOGIC
	// ========================================

	Logger.log("Userscript loaded and initialized.");

	/**
	 * Adds a "Scrape to Markdown" button to the page.
	 */
	function addScrapeButton() {
		Logger.log("Attempting to add scrape button...");
		
		const postElement = DOMUtils.querySelector("shreddit-post", "shreddit-post element");
		if (!postElement) {
			Logger.error("Execution stopped: Could not find shreddit-post element.");
			return;
		}

		const buttonContainer = postElement.querySelector("#pdp-credit-bar");
		if (!buttonContainer) {
			Logger.error("Execution stopped: Could not find the button container (#pdp-credit-bar).");
			return;
		}

		Logger.log("Found button container (#pdp-credit-bar). Creating button...");
		const scrapeButton = DOMUtils.createStyledButton("Scrape to Markdown", "scrape-to-markdown-btn", scrapeThread);
		buttonContainer.appendChild(scrapeButton);
		Logger.log("Successfully created and appended scrape button.");
	}

	/**
	 * Initiates the scraping process and handles the markdown generation and download.
	 */
	async function scrapeThread() {
		Logger.log("--- SCRAPE PROCESS INITIATED ---");
		let markdownContent = "";

		// --- Scrape Post ---
		Logger.log("Step 1: Scraping main post...");
		const postElement = DOMUtils.querySelector("shreddit-post", "main post element");
		if (!postElement) {
			Logger.error("Execution stopped: Could not find the main post element during scrape.");
			return;
		}

		const postData = PostExtractor.extractPostData(postElement);
		if (!postData) {
			Logger.error("Execution stopped: Could not extract post data.");
			return;
		}

		markdownContent += MarkdownUtils.formatPostHeader(postData);
		if (postData.content) {
			markdownContent += `${postData.content}\n\n`;
		}
		Logger.log("Step 1: Main post scraping complete.");

		markdownContent += "---\n\n## Comments\n\n";

		// --- Scrape Comments ---
		Logger.log("Step 2: Scraping comments...");
		const commentsData = CommentExtractor.extractAllComments();
		
		for (const commentData of commentsData) {
			markdownContent += MarkdownUtils.formatComment(commentData);
		}
		Logger.log("Step 2: Comment scraping complete.");

		// --- Download Markdown File ---
		Logger.log("Step 3: Preparing file for download...");
		const filename = FileUtils.generateFilename();
		Logger.log(`  - Filename set to: ${filename}`);
		Logger.log(`  - Total markdown content length: ${markdownContent.length}`);

		FileUtils.downloadMarkdown(markdownContent, filename);
		Logger.log(`--- SCRAPE PROCESS COMPLETE: Download initiated for ${filename} ---`);
	}

	/**
	 * Initializes the userscript by setting up event listeners and button creation
	 */
	function initializeScript() {
		Logger.log("Setting up load listener...");
		window.addEventListener("load", () => {
			Logger.log("'load' event fired. Waiting 2 seconds for page to stabilize...");
			setTimeout(() => {
				Logger.log("Timer finished. Checking for existing button...");
				if (!document.getElementById("scrape-to-markdown-btn")) {
					addScrapeButton();
				} else {
					Logger.log("Scrape button already exists. No action taken.");
				}
			}, 2000);
		});
	}

	// ========================================
	// SCRIPT INITIALIZATION
	// ========================================

	initializeScript();
})();
