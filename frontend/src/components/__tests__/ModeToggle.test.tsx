import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ModeToggle } from "../ModeToggle";

describe("ModeToggle", () => {
	it("renders monthly and annual options", () => {
		render(<ModeToggle value="monthly" onChange={() => {}} />);

		expect(screen.getByText("Monthly")).toBeInTheDocument();
		expect(screen.getByText("Annual")).toBeInTheDocument();
	});

	it("calls onChange with the selected mode", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(<ModeToggle value="monthly" onChange={onChange} />);

		await user.click(screen.getByRole("radio", { name: /^annual$/i }));
		expect(onChange).toHaveBeenCalledWith("annual");
	});
});
