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

	/**
	 * Creates a standardized log prefix with a title, emoji, and timestamp.
	 * @returns {string} The formatted log prefix.
	 */
	function getPrefix() {
		const title = "Reddit Scraper";
		const emoji = "📜";
		const now = new Date();
		const timestamp = now.toTimeString().slice(0, 8);
		return `${title} ${emoji} [${timestamp}]:`;
	}

	console.log(getPrefix(), "Userscript loaded and initialized.");

	/**
	 * Adds a "Scrape to Markdown" button to the page.
	 */
	function addScrapeButton() {
		console.log(getPrefix(), "Attempting to add scrape button...");
		const postElement = document.querySelector("shreddit-post");
		if (!postElement) {
			console.error(getPrefix(), "Execution stopped: Could not find shreddit-post element.");
			return;
		}
		console.log(getPrefix(), "Found shreddit-post element.");

		const buttonContainer = postElement.querySelector("#pdp-credit-bar");

		if (buttonContainer) {
			console.log(getPrefix(), "Found button container (#pdp-credit-bar). Creating button...");
			const scrapeButton = document.createElement("button");
			scrapeButton.textContent = "Scrape to Markdown";
			scrapeButton.style.marginLeft = "10px";
			scrapeButton.style.padding = "5px 10px";
			scrapeButton.style.border = "1px solid var(--color-neutral-border-weak)";
			scrapeButton.style.borderRadius = "20px";
			scrapeButton.style.cursor = "pointer";
			scrapeButton.style.backgroundColor = "var(--color-neutral-background-weak)";
			scrapeButton.style.color = "var(--color-neutral-content-weak)";
			scrapeButton.id = "scrape-to-markdown-btn";

			scrapeButton.addEventListener("click", scrapeThread);
			buttonContainer.appendChild(scrapeButton);
			console.log(getPrefix(), "Successfully created and appended scrape button.");
		} else {
			console.error(
				getPrefix(),
				"Execution stopped: Could not find the button container (#pdp-credit-bar)."
			);
		}
	}

	/**
	 * Initiates the scraping process and handles the markdown generation and download.
	 */
	async function scrapeThread() {
		console.log(getPrefix(), "--- SCRAPE PROCESS INITIATED ---");
		let markdownContent = "";

		// --- Scrape Post ---
		console.log(getPrefix(), "Step 1: Scraping main post...");
		const postElement = document.querySelector("shreddit-post");
		if (postElement) {
			// --- VERBOSE LOGGING: Inspecting the post element ---
			console.log(getPrefix(), "Inspecting shreddit-post element attributes:");
			const attrs = {};
			for (const attr of postElement.attributes) {
				attrs[attr.name] = attr.value;
			}
			console.dir(attrs);
			// --- END VERBOSE LOGGING ---

			const title = postElement.postTitle || postElement.getAttribute("post-title");
			const author = postElement.author || postElement.getAttribute("author");
			const subreddit = postElement.subredditName || postElement.getAttribute("subreddit-name");
			const score = postElement.score || postElement.getAttribute("score");

			console.log(getPrefix(), `  - Title: ${title}`);
			console.log(getPrefix(), `  - Author: u/${author}`);
			console.log(getPrefix(), `  - Subreddit: r/${subreddit}`);
			console.log(getPrefix(), `  - Score: ${score}`);

			markdownContent += `# ${title}\n\n`;
			markdownContent += `**Subreddit:** r/${subreddit}\n`;
			markdownContent += `**Author:** u/${author}\n`;
			markdownContent += `**Score:** ${score}\n\n`;

			const postBody = postElement.querySelector('[id$="-post-rtjson-content"]');
			if (postBody) {
				const postText = postBody.innerText.trim();
				markdownContent += `${postText}\n\n`;
				console.log(getPrefix(), `  - Post body found with length: ${postText.length}`);
			} else {
				console.warn(getPrefix(), "  - Post body content element not found.");
			}
			console.log(getPrefix(), "Step 1: Main post scraping complete.");
		} else {
			console.error(
				getPrefix(),
				"Execution stopped: Could not find the main post element during scrape."
			);
			return;
		}

		markdownContent += "---\n\n## Comments\n\n";

		// --- Scrape Comments ---
		console.log(getPrefix(), "Step 2: Scraping comments...");
		const commentTree = document.querySelector("shreddit-comment-tree");
		if (commentTree) {
			const comments = commentTree.querySelectorAll("shreddit-comment");
			console.log(getPrefix(), `  - Found ${comments.length} comment elements to process.`);
			for (let i = 0; i < comments.length; i++) {
				const comment = comments[i];
				console.log(getPrefix(), `  - Processing comment ${i + 1} of ${comments.length}...`);
				markdownContent += processComment(comment);
			}
			console.log(getPrefix(), "Step 2: Comment scraping complete.");
		} else {
			console.error(getPrefix(), "Execution stopped: Could not find the comment tree.");
		}

		// --- Download Markdown File ---
		console.log(getPrefix(), "Step 3: Preparing file for download...");
		const threadTitle = document.title
			.replace(/ : r\/.*/, "")
			.replace(/[^a-z0-9]/gi, "_")
			.toLowerCase();
		const filename = `${threadTitle}.md`;
		console.log(getPrefix(), `  - Filename set to: ${filename}`);
		console.log(getPrefix(), `  - Total markdown content length: ${markdownContent.length}`);

		// --- VERBOSE LOGGING: Blob and URL creation ---
		console.log(getPrefix(), "Creating Blob for download...");
		const blob = new Blob([markdownContent], { type: "text/markdown;charset=utf-8" });
		console.log(getPrefix(), "Blob created:", blob);
		const url = URL.createObjectURL(blob);
		console.log(getPrefix(), `Object URL created: ${url}`);
		// --- END VERBOSE LOGGING ---

		// Clean download method using temporary anchor element
		console.log(getPrefix(), "Initiating download via temporary anchor element...");
		const a = document.createElement("a");
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		// Cleanup
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		console.log(getPrefix(), `--- SCRAPE PROCESS COMPLETE: Download initiated for ${filename} ---`);
	}

	/**
	 * Processes a single comment element and its replies.
	 * @param {HTMLElement} commentElement - The shreddit-comment element.
	 * @returns {string} The formatted markdown for the comment.
	 */
	function processComment(commentElement) {
		let commentMarkdown = "";
		const depth = parseInt(commentElement.getAttribute("depth"), 10) || 0;
		const indent = "  ".repeat(depth * 2);

		const author = commentElement.getAttribute("author");
		const score = commentElement.getAttribute("score");
		const contentElement = commentElement.querySelector('[id$="-comment-rtjson-content"] > div');

		if (author && contentElement) {
			const content = contentElement.innerText.trim();
			commentMarkdown += `${indent}- **u/${author}** (*${score} points*):\n`;
			commentMarkdown += `${indent}  > ${content.replace(/\n/g, `\n${indent}  > `)}\n\n`;
		} else {
			console.warn(getPrefix(), `    - Could not extract full details from a comment.`, {
				author,
				contentElement: !!contentElement,
			});
		}

		return commentMarkdown;
	}

	console.log(getPrefix(), "Setting up load listener...");
	window.addEventListener("load", () => {
		console.log(getPrefix(), "'load' event fired. Waiting 2 seconds for page to stabilize...");
		setTimeout(() => {
			console.log(getPrefix(), "Timer finished. Checking for existing button...");
			if (!document.getElementById("scrape-to-markdown-btn")) {
				addScrapeButton();
			} else {
				console.log(getPrefix(), "Scrape button already exists. No action taken.");
			}
		}, 2000);
	});
})();
