type ErrorBannerProps = {
	message: string;
	onRetry?: () => void;
};

export const ErrorBanner = ({ message, onRetry }: ErrorBannerProps) => {
	return (
		<div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
			<div className="flex items-center justify-between gap-4">
				<p>{message}</p>
				{onRetry && (
					<button
						type="button"
						onClick={onRetry}
						className="rounded-md border border-red-200 px-3 py-1 text-xs font-semibold text-red-700 transition-colors hover:bg-white"
					>
						Retry
					</button>
				)}
			</div>
		</div>
	);
};
