import "@testing-library/jest-dom/vitest";

class ResizeObserverStub implements ResizeObserver {
	callback: ResizeObserverCallback;

	constructor(callback: ResizeObserverCallback) {
		this.callback = callback;
	}

	disconnect(): void {}

	observe(): void {}

	unobserve(): void {}

	takeRecords(): ResizeObserverEntry[] {
		return [];
	}
}

if (!globalThis.ResizeObserver) {
	globalThis.ResizeObserver =
		ResizeObserverStub as unknown as typeof ResizeObserver;
}

if (!Element.prototype.scrollIntoView) {
	Element.prototype.scrollIntoView = () => {};
}
