import { Logger } from "../utils/logger";
import { scrapeThread } from "../actions/scrape";

const NS = `uc_${Math.random().toString(36).slice(2, 10)}`;

export function injectButton() {
	if (document.getElementById(NS)) return; // Already injected check stays here, it's a DOM guard

	const postElement = document.querySelector("shreddit-post");
	if (!postElement) return;

	const buttonContainer = postElement.querySelector("#pdp-credit-bar");
	if (!buttonContainer) return;

	const button = document.createElement("button");
	button.id = NS;
	button.textContent = "Scrape to Markdown";
	button.style.marginLeft = "10px";
	button.style.padding = "5px 10px";
	button.style.border = "1px solid var(--color-neutral-border-weak)";
	button.style.borderRadius = "20px";
	button.style.cursor = "pointer";
	button.style.backgroundColor = "var(--color-neutral-background-weak)";
	button.style.color = "var(--color-neutral-content-weak)";
	button.addEventListener("click", scrapeThread);

	buttonContainer.appendChild(button);
	Logger.log("Successfully created and appended scrape button.");
}
