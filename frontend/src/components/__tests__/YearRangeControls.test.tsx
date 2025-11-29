import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { YearRangeControls } from "../YearRangeControls";

describe("YearRangeControls", () => {
	it("renders helper text and calls onChange", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(
			<YearRangeControls
				values={{ from: "1900", to: "2000" }}
				errors={{}}
				onChange={onChange}
				minYear={1850}
				maxYear={2020}
			/>,
		);

		const fromInput = screen.getByLabelText("From year");
		await user.type(fromInput, "{backspace}1");
		await user.tab();
		expect(onChange).toHaveBeenCalled();
		expect(screen.getByText("≥ 1850")).toBeInTheDocument();
		expect(screen.getByText("≤ 2020")).toBeInTheDocument();
	});

	it("shows validation errors", () => {
		render(
			<YearRangeControls
				values={{ from: "1900", to: "1901" }}
				errors={{ from: "Error from", to: "Error to" }}
				onChange={() => {}}
			/>,
		);

		expect(screen.getByText("Error from")).toBeInTheDocument();
		expect(screen.getByText("Error to")).toBeInTheDocument();
	});
});
