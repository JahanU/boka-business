import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
	children: ReactNode;
}

interface State {
	hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
	state: State = { hasError: false };

	static getDerivedStateFromError(): State {
		return { hasError: true };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error('ErrorBoundary caught an error:', error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			return (
				<div className="flex h-[400px] flex-col items-center justify-center gap-4 p-6 text-center">
					<h2 className="text-lg font-semibold">Something went wrong</h2>
					<p className="text-sm text-muted-foreground">
						Failed to load this part of the app. Please try refreshing the page.
					</p>
					<button
						type="button"
						onClick={() => window.location.reload()}
						className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
					>
						Reload page
					</button>
				</div>
			);
		}

		return this.props.children;
	}
}
