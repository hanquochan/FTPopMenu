import {
  searchBanks,
  linkBanks,
  unlinkMachine,
  handleError,
  getCandidateNeighbours,
  getCurrentlyLinked
} from "utilities/ajax";

import {
  REQUEST_BANKED_MACHINE_API,
  RECEIVE_CURRENT_LINKED,
  RECEIVE_CANDIDATES,
  RECEIVE_OTHER_BANK,
  RECEIVE_BANKED_MACHINE_API,
  UPDATE_DISMISS_TIME,
  RESET_OTHER_BANK
} from "./constants";

import { SEARCH_TYPE } from "components/search_bar/constants";
import {
  setSearchValue,
  setSearchActiveView
} from "components/search_bar/actions";

function requestBankedMachineAPI() {
  return {
    type: REQUEST_BANKED_MACHINE_API
  };
}

export function receiveCurrentLinked(data) {
  return {
    type: RECEIVE_CURRENT_LINKED,
    data
  };
}

export function fetchCurrentLinked(id) {
  return dispatch => {
    dispatch(requestBankedMachineAPI());
    return getCurrentlyLinked({
      id
    })
      .then(response => {
        dispatch(receiveCurrentLinked(response.data));
      })
      .catch(err => {
        dispatch(receiveBankedMachineAPI());
        dispatch(handleError(err));
      });
  };
}

export function receiveCandidates(data) {
  return {
    type: RECEIVE_CANDIDATES,
    data
  };
}

export function fetchCandidates(id) {
  return dispatch => {
    dispatch(requestBankedMachineAPI());
    return getCandidateNeighbours({
      id
    })
      .then(response => {
        dispatch(receiveCandidates(response.data));
      })
      .catch(err => {
        dispatch(receiveBankedMachineAPI());
        dispatch(handleError(err));
      });
  };
}

export function receiveOtherBank(data) {
  return {
    type: RECEIVE_OTHER_BANK,
    data
  };
}

export function fetchOtherBank() {
  return (dispatch, getState) => {
    const state = getState();
    const text = state.search[SEARCH_TYPE.OTHER_BANK].value;

    if (state.search[SEARCH_TYPE.OTHER_BANK].value.length === 0) {
      dispatch(receiveOtherBank({ result: [] }));
    } else {
      dispatch(requestBankedMachineAPI());
      return searchBanks({
        id: state.current.machine.id,
        text
      })
        .then(response => {
          dispatch(receiveOtherBank(response.data));
        })
        .catch(err => {
          dispatch(receiveBankedMachineAPI());
          dispatch(handleError(err));
        });
    }
  };
}

export function resetOtherMachineView() {
  return dispatch => {
    dispatch(setSearchActiveView(SEARCH_TYPE.FLAVOURS));
    dispatch(setSearchValue("", SEARCH_TYPE.OTHER_BANK));
    dispatch(resetOtherBank());
  };
}

export function updateSelectBank(params) {
  const { id, isSelected, bankId, machineId } = params;

  return (dispatch, getState) => {
    const state = getState();
    dispatch(requestBankedMachineAPI());
    const currentMachineId = state.current.machine.id;

    const requestAPI = isSelected ? linkBanks : unlinkMachine;
    const requestParams = isSelected
      ? {
          bank_id1: state.bankedMachines.currentLinked.bank.id,
          bank_id2: id
        }
      : {
          id: machineId || currentMachineId,
          bank_id: bankId || id
        };
    return requestAPI(requestParams)
      .then(() => {
        dispatch(fetchCurrentLinked(currentMachineId));
        dispatch(fetchCandidates(currentMachineId));
      })
      .catch(err => {
        dispatch(receiveBankedMachineAPI());
        dispatch(handleError(err));
      });
  };
}

function receiveBankedMachineAPI() {
  return {
    type: RECEIVE_BANKED_MACHINE_API
  };
}

export function updateDismissTime(dismissTime) {
  return {
    type: UPDATE_DISMISS_TIME,
    dismissTime
  };
}

function resetOtherBank() {
  return {
    type: RESET_OTHER_BANK
  };
}
