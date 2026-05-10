import { Logger } from "../utils/logger";

export const DownloadAdapter = {
	generateFilename() {
		const threadTitle = document.title
			.replace(/ : r\/.*/, "")
			.replace(/[^a-z0-9]/gi, "_")
			.toLowerCase();
		return `${threadTitle}.md`;
	},
	downloadMarkdown(content: string, filename: string) {
		Logger.log("Creating Blob for download...");
		const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		
		const downloadLink = document.createElement("a");
		downloadLink.href = url;
		downloadLink.download = filename;
		downloadLink.style.display = "none";

		document.body.appendChild(downloadLink);
		downloadLink.click();
		
		setTimeout(() => {
			document.body.removeChild(downloadLink);
			URL.revokeObjectURL(url);
		}, 100);
	}
};
