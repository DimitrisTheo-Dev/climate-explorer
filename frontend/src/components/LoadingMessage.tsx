type LoadingMessageProps = {
	label?: string;
};

export const LoadingMessage = ({
	label = "Loading data…",
}: LoadingMessageProps) => (
	<div className="flex min-h-[160px] items-center justify-center text-sm font-medium text-slate-600">
		<span className="inline-flex items-center gap-2">
			<span
				className="size-2 rounded-full bg-brand animate-pulse"
				aria-hidden="true"
			/>
			{label}
		</span>
	</div>
);
