interface CalculatorData {
	identifier: string;

	city: string;
	title: string;
	year: number;
	theme: Theme;

	taxes: Tax[];
	fees: Fee[];
	grants: Grant[];
	insights: Insights;
}

interface Theme {
	showTitle: boolean;
	hasHeader: boolean;

	headerTheme: string;
	backgroundTheme: string;
}

interface Tax {
	name: string;
	values: {
		current: number;
		previous: number;
	}
}

interface Fee {
	name: string;
	requiresOccupancyState?: boolean;
	values: {
		current: number;
		previous: number;
	}
}

interface Insights {
	increase: number;
	currentAvg: number;
	previousAvg: number;
}

interface Grant {
	name: string;
	value: number;
}
