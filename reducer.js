import {
  REQUEST_BANKED_MACHINE_API,
  RECEIVE_CURRENT_LINKED,
  RECEIVE_CANDIDATES,
  RECEIVE_OTHER_BANK,
  UPDATE_SELECT_BANK,
  UPDATE_SELECT_OTHER_BANK,
  RECEIVE_BANKED_MACHINE_API,
  UPDATE_DISMISS_TIME,
  RESET_OTHER_BANK
} from "./constants.js";

const initialState = {
  isFetching: false,
  dismissTime: 0,
  bankId: null,
  currentLinked: {
    bank: {}
  },
  neighbours: [],
  otherBank: []
};

function requestAPI(state) {
  return {
    ...state,
    isFetching: true
  };
}

function receiveAPI(state) {
  return {
    ...state,
    isFetching: false
  };
}

function setCurrentLinked(state, action) {
  action.data.bank.isSelected = true;
  let otherBank = [];
  if (state.otherBank.length > 0) {
    const currentLinkedBankId = action.data.machines.map(item => item.id);
    otherBank = state.otherBank.filter(
      item => currentLinkedBankId.indexOf(item.bank.id) === -1
    );
  }

  return {
    ...state,
    isFetching: false,
    currentLinked: action.data,
    otherBank
  };
}

function setCandidates(state, action) {
  return {
    ...state,
    isFetching: false,
    neighbours: action.data.neighbours
  };
}

function setOtherBank(state, action) {
  return {
    ...state,
    isFetching: false,
    otherBank: action.data.result
  };
}

function updateSelectBank(state, action) {
  const { machineId, bankType, isSelected } = action.data;
  const updateData = state[bankType].map(item => {
    if (item.pk === machineId) {
      item.isSelected = isSelected;
    }
    return item;
  });

  return {
    ...state,
    isFetching: false,
    [bankType]: updateData
  };
}

function updateSelectOtherBank(state, action) {
  const { machineId, bankType } = action.data;

  return {
    ...state,
    isFetching: false,
    [bankType]: state[bankType].filter(item => item.pk !== machineId),
    bankMembers: state.bankMembers.concat(
      state[bankType].filter(item => item.pk === machineId).map(item => {
        item.isSelected = true;
        return item;
      })
    )
  };
}

function updateDismissTime(state, action) {
  return {
    ...state,
    dismissTime: action.dismissTime
  };
}

function resetOtherBank(state) {
  return {
    ...state,
    otherBank: []
  };
}

export default function bankedMachines(state = initialState, action) {
  switch (action.type) {
    case REQUEST_BANKED_MACHINE_API:
      return requestAPI(state);
    case RECEIVE_CURRENT_LINKED:
      return setCurrentLinked(state, action);
    case RECEIVE_CANDIDATES:
      return setCandidates(state, action);
    case RECEIVE_OTHER_BANK:
      return setOtherBank(state, action);
    case UPDATE_SELECT_BANK:
      return updateSelectBank(state, action);
    case UPDATE_SELECT_OTHER_BANK:
      return updateSelectOtherBank(state, action);
    case RECEIVE_BANKED_MACHINE_API:
      return receiveAPI(state, action);
    case UPDATE_DISMISS_TIME:
      return updateDismissTime(state, action);
    case RESET_OTHER_BANK:
      return resetOtherBank(state, action);
    default:
      return state;
  }
}
