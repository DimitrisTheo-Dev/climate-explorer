type EmptyStateProps = {
	title: string;
	description: string;
	action?: React.ReactNode;
};

export const EmptyState = ({ title, description, action }: EmptyStateProps) => (
	<div className="flex flex-col items-center text-center">
		<p className="text-base font-semibold text-slate-800">{title}</p>
		<p className="mt-1 max-w-xl text-sm text-slate-500">{description}</p>
		{action && <div className="mt-4">{action}</div>}
	</div>
);
