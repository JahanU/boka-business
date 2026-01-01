import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

export type TimePickerProps = React.InputHTMLAttributes<HTMLInputElement>;

const TimePicker = React.forwardRef<HTMLInputElement, TimePickerProps>(
	({ className, ...props }, ref) => {
		return (
			<div className="relative group">
				<Input
					type="time"
					className={cn(
						"bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none pr-10",
						className
					)}
					ref={ref}
					{...props}
				/>
				<div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
					<Clock className="h-4 w-4" />
				</div>
			</div>
		);
	}
);
TimePicker.displayName = "TimePicker";

export { TimePicker };
