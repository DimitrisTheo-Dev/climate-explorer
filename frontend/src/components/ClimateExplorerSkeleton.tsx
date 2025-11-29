import { AnalyticsStrip } from "./AnalyticsStrip";
import { Card } from "./ui/card";
import { cn } from "../lib/utils";

const SkeletonLine = ({ className }: { className?: string }) => (
	<div className={cn("h-3 rounded-full bg-slate-200/80 animate-pulse", className)} />
);

const SkeletonBlock = ({ className }: { className?: string }) => (
	<div className={cn("rounded-2xl bg-slate-100 animate-pulse", className)} />
);

const FilterSkeleton = () => (
	<div className="flex h-full flex-col gap-4">
		<Card className="border border-slate-200/80 bg-slate-50/70 p-4 shadow-none">
			<div className="space-y-4">
				<div>
					<SkeletonLine className="h-2.5 w-24" />
					<SkeletonLine className="mt-2 h-2 w-36" />
				</div>
				<SkeletonBlock className="h-5 w-48 rounded-full" />
				<SkeletonBlock className="h-11 w-full rounded-xl" />
				<SkeletonLine className="h-2 w-40" />
			</div>
		</Card>
		<Card className="flex flex-col gap-5 border border-slate-200 bg-white/95 p-4 shadow-card sm:p-5">
			<div className="space-y-3">
				<SkeletonLine className="h-2.5 w-20" />
				<SkeletonBlock className="h-10 w-full rounded-xl" />
				<SkeletonLine className="h-2 w-32" />
			</div>
			<div className="space-y-2">
				<SkeletonLine className="h-2.5 w-16" />
				<div className="grid grid-cols-2 gap-2">
					{Array.from({ length: 2 }).map((_, index) => (
						<SkeletonBlock key={index} className="h-16 rounded-2xl" />
					))}
				</div>
			</div>
			<div className="space-y-2">
				<SkeletonLine className="h-2.5 w-16" />
				<div className="grid gap-3 sm:grid-cols-2">
					{Array.from({ length: 2 }).map((_, index) => (
						<div key={index} className="space-y-2">
							<SkeletonLine className="h-2 w-14" />
							<SkeletonBlock className="h-10 rounded-xl" />
							<SkeletonLine className="h-2 w-20" />
						</div>
					))}
				</div>
			</div>
			<SkeletonBlock className="h-10 w-full rounded-xl" />
			<SkeletonLine className="h-2 w-40" />
		</Card>
	</div>
);

export const ClimateExplorerSkeleton = () => (
	<main className="min-h-screen bg-background">
		<div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-5 px-4 py-6 lg:py-8">
			<header className="space-y-2">
				<SkeletonLine className="h-2 w-32" />
				<SkeletonLine className="h-6 w-80 rounded-lg" />
				<SkeletonLine className="h-3 w-full max-w-2xl" />
			</header>

			<div className="flex-1 space-y-4">
				<div className="lg:hidden">
					<SkeletonBlock className="h-10 w-full rounded-xl" />
				</div>

				<div className="grid flex-1 gap-4 lg:grid-cols-[350px,minmax(0,1fr)]">
					<aside className="hidden rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-card sm:p-5 lg:block lg:h-full">
						<FilterSkeleton />
					</aside>

					<section className="flex min-h-[520px] flex-col gap-4">
						<AnalyticsStrip isLoading data={undefined} />
						<Card className="flex flex-1 items-center justify-center border border-dashed border-slate-300 bg-white/95 p-8">
							<SkeletonBlock className="h-64 w-full max-w-2xl rounded-[32px]" />
						</Card>
					</section>
				</div>
			</div>
		</div>
	</main>
);
