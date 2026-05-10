import { injectButton } from "./ui/injector";

let isRunning = false;

function main() {
	if (!window.location.hostname.includes("reddit.com")) return;
	if (!window.location.pathname.includes("/comments/")) return;
	if (isRunning) return;

	isRunning = true;
	try {
		injectButton(); // Just creates and appends the button, no guards
	} finally {
		isRunning = false;
	}
}

setInterval(main, 300);
