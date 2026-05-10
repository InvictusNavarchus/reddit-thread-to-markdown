import { Logger } from "../utils/logger";

export const RedditAdapter = {
	extractPostData() {
		const postElement = document.querySelector<HTMLElement>("shreddit-post");
		if (!postElement) return null;

		const title = postElement.getAttribute("post-title") || "";
		const author = postElement.getAttribute("author") || "";
		const subreddit = postElement.getAttribute("subreddit-name") || "";
		const score = postElement.getAttribute("score") || "";

		const postBody = postElement.querySelector<HTMLElement>('[id$="-post-rtjson-content"]');
		const content = postBody ? postBody.innerText.trim() : "";

		return { title, author, subreddit, score, content };
	},
	extractAllComments() {
		const commentTree = document.querySelector("shreddit-comment-tree");
		if (!commentTree) return [];

		const comments = commentTree.querySelectorAll<HTMLElement>("shreddit-comment");
		const commentData = [];

		for (let i = 0; i < comments.length; i++) {
			const el = comments[i];
			const depth = parseInt(el.getAttribute("depth") || "0", 10);
			const author = el.getAttribute("author");
			const score = el.getAttribute("score");
			const contentElement = el.querySelector<HTMLElement>('[id$="-comment-rtjson-content"] > div');

			if (author && contentElement) {
				commentData.push({
					author,
					score: score || "0",
					content: contentElement.innerText.trim(),
					depth
				});
			}
		}
		return commentData;
	}
};
