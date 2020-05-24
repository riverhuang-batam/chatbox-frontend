const initialState = {
  dataMessage: [],
  RecentChatContacts: [],
  RecentChatContacts2: [],
  DetailChatRecentContact: {},
};

const ChatReducer = (state = initialState, action) => {
  switch (action.type) {
    case "CREATE_NEW_CHAT_CONTACT":
      console.log(action.payload);
      const find = state.RecentChatContacts.find((item) => {
        return item._id === action.payload._id;
      });
      let newRecentChatContacts = [];

      if (!find) {
        newRecentChatContacts = [action.payload, ...state.RecentChatContacts2];
      } else {
        newRecentChatContacts = state.RecentChatContacts2;
      }

      return {
        ...state,
        RecentChatContacts2: newRecentChatContacts,
      };

    case "SHOW_DETAIL_RECENT_CHAT":
      return { ...state, DetailChatRecentContact: action.payload };

    case "FETCH_HISTORY_CHAT":
      return { ...state, RecentChatContacts: action.payload };

    case "ADD_MESSAGE":
      console.log(state.dataMessage);

      return { ...state, dataMessage: [action.payload] };
    case "GET_DATA_MESSAGE":
      const found = state.dataMessage.find((item) => {
        return item._id === action.payload._id;
      });

      let newDataMessage = [];
      // console.log(state.dataMessage);

      if (!found) {
        newDataMessage = [...state.dataMessage, action.payload];
      } else {
        newDataMessage = state.dataMessage.map((item) => {
          if (action.payload._id === item._id) {
            return action.payload;
          }
          return item;
        });
      }

      // console.log(newDataMessage);

      return { ...state, dataMessage: newDataMessage };
    default:
      return state;
  }
};

export default ChatReducer;
