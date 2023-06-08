import React from 'react';
import intervalToDuration from 'date-fns/intervalToDuration';

const date = new Date(2023, 8, 16);
export function CounterDownDate() {
	const [left, setLeft] = React.useState<Duration>({
		days: 0,
		hours: 0,
		minutes: 0,
		seconds: 0,
	});

	function setTimes() {
		const now = new Date();
		setLeft(
			intervalToDuration({
				start: date,
				end: now,
			}),
		);
	}

	React.useEffect(() => {
		setTimes();
		const interval = setInterval(() => {
			setTimes();
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	return (
		<div className="grid auto-cols-max grid-flow-col gap-5 text-center">
			{left.months !== 0 && (
				<CounterDown label="Meses" value={left.months} />
			)}
			<CounterDown label="Dias" value={left.days} />
			<CounterDown label="Horas" value={left.hours} />
			<CounterDown label="Min" value={left.minutes} />
			<CounterDown label="Seg" value={left.seconds} />
		</div>
	);
}

interface CounterDownProps {
	value?: number;
	label: string;
}

function CounterDown(props: CounterDownProps) {
	const { value, label } = props;
	const ref = React.useRef<HTMLSpanElement>(null);

	React.useEffect(() => {
		if (ref.current) {
			ref.current.style.setProperty('--value', String(value));
		}
	}, [value]);

	if (value === undefined) {
		return null;
	}

	return (
		<div className="flex flex-col">
			<span className="countdown font-mono text-4xl">
				<span ref={ref}></span>
			</span>

			{label}
		</div>
	);
}
