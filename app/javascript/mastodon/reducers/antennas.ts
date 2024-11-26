import type { Reducer } from '@reduxjs/toolkit';
import { Map as ImmutableMap } from 'immutable';

import { createAntenna, updateAntenna } from 'mastodon/actions/antennas_typed';
import type { ApiAntennaJSON } from 'mastodon/api_types/antennas';
import { createAntenna as createAntennaFromJSON } from 'mastodon/models/antenna';
import type { Antenna } from 'mastodon/models/antenna';

import {
  ANTENNA_FETCH_SUCCESS,
  ANTENNA_FETCH_FAIL,
  ANTENNAS_FETCH_SUCCESS,
  ANTENNA_DELETE_SUCCESS,
} from '../actions/antennas';

const initialState = ImmutableMap<string, Antenna | null>();
type State = typeof initialState;

const normalizeAntenna = (state: State, antenna: ApiAntennaJSON) => {
  let s = state.set(antenna.id, createAntennaFromJSON(antenna));

  const old = state.get(antenna.id);
  if (old === undefined) {
    return s;
  }

  if (old) {
    s = s.setIn([antenna.id, 'domains'], old.get('domains'));
    s = s.setIn([antenna.id, 'exclude_domains'], old.get('exclude_domains'));
    s = s.setIn([antenna.id, 'keywords'], old.get('keywords'));
    s = s.setIn([antenna.id, 'exclude_keywords'], old.get('exclude_keywords'));
    s = s.setIn([antenna.id, 'tags'], old.get('tags'));
    s = s.setIn([antenna.id, 'exclude_tags'], old.get('exclude_tags'));
    s = s.setIn([antenna.id, 'accounts_count'], old.get('accounts_count'));
    s = s.setIn([antenna.id, 'domains_count'], old.get('domains_count'));
    s = s.setIn([antenna.id, 'keywords_count'], old.get('keywords_count'));
  }
  return s;
};

const normalizeAntennas = (state: State, antennas: ApiAntennaJSON[]) => {
  antennas.forEach((antenna) => {
    state = normalizeAntenna(state, antenna);
  });

  return state;
};

export const antennasReducer: Reducer<State> = (
  state = initialState,
  action,
) => {
  if (
    createAntenna.fulfilled.match(action) ||
    updateAntenna.fulfilled.match(action)
  ) {
    return normalizeAntenna(state, action.payload);
  } else {
    switch (action.type) {
      case ANTENNA_FETCH_SUCCESS:
        return normalizeAntenna(state, action.antenna as ApiAntennaJSON);
      case ANTENNAS_FETCH_SUCCESS:
        return normalizeAntennas(state, action.antennas as ApiAntennaJSON[]);
      case ANTENNA_DELETE_SUCCESS:
      case ANTENNA_FETCH_FAIL:
        return state.set(action.id as string, null);
      default:
        return state;
    }
  }
};
