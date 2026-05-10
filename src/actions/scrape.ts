import { Logger } from "../utils/logger";
import { MarkdownUtils } from "../utils/markdown";
import { DownloadAdapter } from "../adapters/download";
import { RedditAdapter } from "../adapters/reddit";

export async function scrapeThread() {
	Logger.log("--- SCRAPE PROCESS INITIATED ---");
	let markdownContent = "";

	const postData = RedditAdapter.extractPostData();
	if (!postData) {
		Logger.error("Execution stopped: Could not extract post data.");
		return;
	}

	markdownContent += MarkdownUtils.formatPostHeader(postData);
	if (postData.content) {
		markdownContent += `${postData.content}\n\n`;
	}

	markdownContent += "---\n\n## Comments\n\n";

	const commentsData = RedditAdapter.extractAllComments();
	for (const commentData of commentsData) {
		markdownContent += MarkdownUtils.formatComment(commentData);
	}

	const filename = DownloadAdapter.generateFilename();
	DownloadAdapter.downloadMarkdown(markdownContent, filename);
	Logger.log(`--- SCRAPE PROCESS COMPLETE: Download initiated for ${filename} ---`);
}
