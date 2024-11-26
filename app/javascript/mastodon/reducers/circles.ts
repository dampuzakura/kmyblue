import type { Reducer } from '@reduxjs/toolkit';
import { Map as ImmutableMap } from 'immutable';

import { createCircle, updateCircle } from 'mastodon/actions/circles_typed';
import type { ApiCircleJSON } from 'mastodon/api_types/circles';
import { createCircle as createCircleFromJSON } from 'mastodon/models/circle';
import type { Circle } from 'mastodon/models/circle';

import {
  CIRCLE_FETCH_SUCCESS,
  CIRCLE_FETCH_FAIL,
  CIRCLES_FETCH_SUCCESS,
  CIRCLE_DELETE_SUCCESS,
} from '../actions/circles';

const initialState = ImmutableMap<string, Circle | null>();
type State = typeof initialState;

const normalizeCircle = (state: State, circle: ApiCircleJSON) =>
  state.set(circle.id, createCircleFromJSON(circle));

const normalizeCircles = (state: State, circles: ApiCircleJSON[]) => {
  circles.forEach((circle) => {
    state = normalizeCircle(state, circle);
  });

  return state;
};

export const circlesReducer: Reducer<State> = (
  state = initialState,
  action,
) => {
  if (
    createCircle.fulfilled.match(action) ||
    updateCircle.fulfilled.match(action)
  ) {
    return normalizeCircle(state, action.payload);
  } else {
    switch (action.type) {
      case CIRCLE_FETCH_SUCCESS:
        return normalizeCircle(state, action.circle as ApiCircleJSON);
      case CIRCLES_FETCH_SUCCESS:
        return normalizeCircles(state, action.circles as ApiCircleJSON[]);
      case CIRCLE_DELETE_SUCCESS:
      case CIRCLE_FETCH_FAIL:
        return state.set(action.id as string, null);
      default:
        return state;
    }
  }
};
