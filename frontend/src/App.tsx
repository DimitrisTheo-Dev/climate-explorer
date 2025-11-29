import ClimateExplorerPage from "./pages/ClimateExplorerPage";
import { TooltipProvider } from "./components/ui/tooltip";

const App = () => {
	return (
		<TooltipProvider delayDuration={150}>
			<ClimateExplorerPage />
		</TooltipProvider>
	);
};

export default App;
