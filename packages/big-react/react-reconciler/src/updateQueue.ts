import { Action } from '@xuhan/react-shared/ReactTypes';

export interface Update<State> {
  action: Action<State>;
}

export interface UpdateQueue<State> {
  shared: {
    pending: Update<State> | null;
  };
}

export const createUpdate = <State>(action: Action<State>) => {
  return {
    action,
  };
};

export const createUpdateQueue = <Action>() => {
  return {
    shared: {
      pending: null,
    },
  } as UpdateQueue<Action>;
};

export const enqueueUpdate = <Action>(updateQueue: UpdateQueue<Action>, update: Update<Action>) => {
  updateQueue.shared.pending = update;
};

export const processUpdateQueue = <State>(baseSate: State, pendingUpdate: Update<State> | null) => {
  const result = {
    memorizedState: baseSate,
  };
  if (pendingUpdate !== null) {
    const action = pendingUpdate.action;
    if (typeof action === 'function') {
      const updater = action as (prevState: State) => State;
      result.memorizedState = updater(baseSate);
    } else {
      result.memorizedState = action;
    }
  }

  return result;
};
