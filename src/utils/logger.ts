export const Logger = {
	getPrefix() {
		const title = "Reddit Scraper";
		const emoji = "📜";
		const now = new Date();
		const timestamp = now.toTimeString().slice(0, 8);
		return `${title} ${emoji} [${timestamp}]:`;
	},
	log(...args: any[]) {
		console.log(this.getPrefix(), ...args);
	},
	warn(...args: any[]) {
		console.warn(this.getPrefix(), ...args);
	},
	error(...args: any[]) {
		console.error(this.getPrefix(), ...args);
	},
	debug(...args: any[]) {
		console.dir(...args);
	}
};
