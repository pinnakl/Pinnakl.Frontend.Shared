import { Action, createReducer, on } from '@ngrx/store';
import { AttemptLoadAum, LoadAum, LoadFullAum, LoadAccountsAum } from './aum.actions';

export interface State {
	accountId?: number;
	aum?: number;
	date?: Date;
}

export const initialState: State = {};

const featureReducer = createReducer(
	initialState,
	on(AttemptLoadAum, (state, { accountId, date }) => {
		return {
			...state,
			accountId,
			date
		};
	}),
	on(LoadFullAum, (state, { accountId, aum, date }) => {
		return {
			...state,
			...{ accountId, aum, date }
		};
	}),
	on(LoadAum, (state, { aum }) => {
		return {
			...state,
			aum
		};
	})
);

export function reducer(
	state: State | undefined,
	action: Action
) {
	return featureReducer(state, action);
}

//

const featureAccountsReducer = createReducer(
	[],
	on(LoadAccountsAum, (_, { payload }) => {
		return [...payload];
	})
);

export function accountsReducer(
	state: [] | undefined,
	action: Action
) {
	return featureAccountsReducer(state, action);
}
