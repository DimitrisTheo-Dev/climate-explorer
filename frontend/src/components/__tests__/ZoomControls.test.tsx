import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ZoomControls } from "../ZoomControls";

describe("ZoomControls", () => {
	it("renders preview range and handles reset", async () => {
		const user = userEvent.setup();
		const onReset = vi.fn();

		render(
			<ZoomControls
				focusYear="1950"
				onFocusYearChange={() => {}}
				focusError={undefined}
				zoomPercent={80}
				onZoomChange={() => {}}
				visibleRange={{ from: 1900, to: 2000 }}
				baseRange={{ from: 1900, to: 2000 }}
				onReset={onReset}
			/>,
		);

		expect(screen.getByText(/Viewing 1900 – 2000/)).toBeInTheDocument();
		await user.click(screen.getByRole("button", { name: /reset/i }));
		expect(onReset).toHaveBeenCalled();
	});

	it("displays focus errors when provided", () => {
		render(
			<ZoomControls
				focusYear="1800"
				onFocusYearChange={() => {}}
				focusError="Outside range"
				zoomPercent={50}
				onZoomChange={() => {}}
				visibleRange={{ from: 1900, to: 2000 }}
				baseRange={{ from: 1900, to: 2000 }}
				onReset={() => {}}
			/>,
		);

		expect(screen.getByText("Outside range")).toBeInTheDocument();
	});

	it("updates zoom level via slider interactions", async () => {
		const user = userEvent.setup();
		const onZoomChange = vi.fn();

		render(
			<ZoomControls
				focusYear="1950"
				onFocusYearChange={() => {}}
				focusError={undefined}
				zoomPercent={80}
				onZoomChange={onZoomChange}
				visibleRange={{ from: 1900, to: 2000 }}
				baseRange={{ from: 1900, to: 2000 }}
				onReset={() => {}}
			/>,
		);

		const slider = screen.getByRole("slider");
		slider.focus();
		await user.keyboard("{ArrowRight}");
		expect(onZoomChange).toHaveBeenCalled();
	});
});
