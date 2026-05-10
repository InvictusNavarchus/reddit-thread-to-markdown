export const MarkdownUtils = {
	formatPostHeader(postData: { title: string, subreddit: string, author: string, score: string }) {
		let markdown = `# ${postData.title}\n\n`;
		markdown += `**Subreddit:** r/${postData.subreddit}\n`;
		markdown += `**Author:** u/${postData.author}\n`;
		markdown += `**Score:** ${postData.score}\n\n`;
		return markdown;
	},
	formatComment(commentData: { author: string, score: string, content: string, depth: number }) {
		const { author, score, content, depth } = commentData;
		const indent = "  ".repeat(depth * 2);
		let markdown = `${indent}- **u/${author}** (*${score} points*):\n`;
		markdown += `${indent}  > ${content.replace(/\n/g, `\n${indent}  > `)}\n\n`;
		return markdown;
	}
};
