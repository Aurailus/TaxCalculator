import { ObjectID } from 'mongodb';

export interface Account {
	_id?: ObjectID;
	
	identifier: string;
	name: string;
	pass: string;
}

export interface AuthToken {
	_id?: ObjectID;

	identifier: string;
	token: string;
	expires: number;
}

export interface Calculator {
	_id?: ObjectID;

	identifier: string;

	city: string;
	title: string;
	year: number;
	theme: Theme;

	taxes: Tax[];
	fees: Fee[];
	grants: Grant[];
	defaultGrant: number;
	insights: Insights;
}

export interface Theme {
	showTitle: boolean;
	hasHeader: string;

	headerTheme: string;
	backgroundTheme: string;
}

export interface Tax {
	name: string;
	values: {
		current: number;
		previous: number;
	}
}

export interface Fee {
	name: string;
	requiresOccupancyState?: boolean;
	values: {
		current: number;
		previous: number;
	}
}

export interface Insights {
	increase: number;
	currentAvg: number;
	previousAvg: number;
}

export interface Grant {
	name: string;
	value: number;
}
