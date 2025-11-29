import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { StationSelector } from "../StationSelector";
import type { Station } from "../../types/station";

const stations: Station[] = [
	{ id: "alpha", name: "Greenland Summit", firstYear: 1900, lastYear: 2020 },
	{ id: "beta", name: "Antarctic Ridge", firstYear: 1950, lastYear: 2018 },
];

describe("StationSelector", () => {
	it("renders station options from props", async () => {
		const user = userEvent.setup();
		render(
			<StationSelector
				stations={stations}
				selectedStations={[]}
				onChange={() => {}}
			/>,
		);

		await user.click(screen.getByRole("button", { name: /^stations$/i }));

		expect(await screen.findByText("Greenland Summit")).toBeInTheDocument();
		expect(screen.getByText("Antarctic Ridge")).toBeInTheDocument();
	});

	it("calls onChange when toggling a station", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(
			<StationSelector
				stations={stations}
				selectedStations={[]}
				onChange={onChange}
			/>,
		);

		await user.click(screen.getByRole("button", { name: /^stations$/i }));
		await user.click(screen.getByText("Greenland Summit"));

		expect(onChange).toHaveBeenCalledWith(["alpha"]);
	});

	it("allows selecting multiple stations and updates the summary label", async () => {
		const user = userEvent.setup();

		const Wrapper = () => {
			const [selection, setSelection] = useState<string[]>([]);
			return (
				<StationSelector
					stations={stations}
					selectedStations={selection}
					onChange={setSelection}
				/>
			);
		};

		render(<Wrapper />);

		await user.click(screen.getByRole("button", { name: /^stations$/i }));
		await user.click(screen.getByText("Greenland Summit"));
		await user.click(screen.getByText("Antarctic Ridge"));

		expect(screen.getByText("2 selected")).toBeInTheDocument();
	});

	it("selects all stations via the Select all button", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(
			<StationSelector
				stations={stations}
				selectedStations={[]}
				onChange={onChange}
			/>,
		);

		await user.click(screen.getByRole("button", { name: /select all stations/i }));

		expect(onChange).toHaveBeenCalledWith(["alpha", "beta"]);
	});
});
