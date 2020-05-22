import React, { useEffect, useState } from "react";
import homePicture from "../../assets/text2.png";
import { useParams } from "react-router-dom";
import moment from "moment";
import "../style.css";
import Chatcomponent from "./ChatComponent";
import RecentContact from "./RecentContact";

// import io from "socket.io-client";

import {
  showDetailRecentChat,
  addMessage,
  getDataMessage,
} from "../../actionCreators/ChatAction";
import { connect } from "react-redux";
import { findAllByAltText } from "@testing-library/react";

const Home = (props) => {
  // const socket = io(`${process.env.REACT_APP_API_URL}`);
  const [firstShow, setFirstShow] = useState(true);
  const [targetUserId, setTargetUserId] = useState();
  const [dataMessage, setDataMessage] = useState([]);
  // console.log(targetUserId);
  let { id } = useParams();

  // const [messagesApi, setMessagesApi] = useState([]);

  const [message, setMessage] = useState("");
  // console.log(message);

  const changeFirstShow = (data) => {
    console.log(data);
    setTargetUserId(data._id);
    props.showDetailRecentChat(data);
    setFirstShow(false);
  };

  const handleChangeMessage = (event) => {
    let { value } = event.currentTarget;
    setMessage(value);
  };

  const sendMessage = (dataTargetUserId) => {
    props.addMessage(dataTargetUserId, dataMessage);
    // setMessagesApi("");
    // socket.emit("sendMessage", dataMessage, () => setMessagesApi(""));
  };

  // useEffect(() => {
  //   // console.log(targetUserId);
  //   // setMessagesApi(props.dataMessage);
  //   props.getDataMessage(targetUserId);
  //   // socket.on("sendMessage", (Message) => {
  //   //   setMessagesApi(props.dataMessage, Message);
  //   // });
  // }, [sendMessage, changeFirstShow]);

  useEffect(() => {
    props.getDataMessage(id);

    // const newDataMessage = dataMessage.find((item) => {
    //   return id == item.usersId;
    // });
    // console.log(newDataMessage);
    console.log("useEffect", id);
  }, []);

  useEffect(() => {
    console.log(props.dataMessage);
    console.log(id);

    let newDataMessage = props.dataMessage.find((item) => {
      return item._id == id;
    });
    if (!newDataMessage) {
      setDataMessage(props.dataMessage);
    } else {
      setDataMessage([]);
    }
    console.log(dataMessage);

    // setDataMessage(newDataMessage || []);
  }, [props.dataMessage]);

  let chatDate = undefined;

  return (
    <div className="row mx-0">
      <div className="col-md-4 vh-100 px-0 bg-mainchat border-right-3 border-white scrollable-div">
        <div className="list-group">
          <div className="list-group-item list-group-item-action py-0">
            <div className="text-center mt-2">
              <h4 className="text-white py-2">CIRCLE MESSENGER</h4>
            </div>
            <div className="form-group h-100  mb-4">
              <span className="input-icon">
                <i className="fas fa-search" />
              </span>
              <input
                type="text"
                className="form-control with-icon h6 my-0"
                placeholder="Search Contacts..."
              />
            </div>
          </div>
        </div>

        <div>
          {props.RecentChatContacts.map((item, index) => {
            return (
              <RecentContact
                item={item}
                key={index}
                changeFirstShow={changeFirstShow}
              />
            );
          })}
        </div>
      </div>

      {firstShow ? (
        <div className="col-md-8 bg-light vh-100">
          <div className="text-center center-div">
            <img src={homePicture} alt="..." className="w-50" />
            <h2>Welcome to Circle Messenger!</h2>
            <h4>“Executive Chatbox, for Professionals.”</h4>
          </div>
        </div>
      ) : (
        <div className="col-md-8 px-0">
          <div className="bg-main support-scrollable-div">
            <div className="bg-light d-flex py-2">
              <img
                src={props.DetailChatRecentContact.image}
                alt="..."
                className="rounded-circle img-chat ml-3"
              />
              <h5 className="align-self-center font-weight-bold pl-2 my-0">
                {props.DetailChatRecentContact.username}
              </h5>
            </div>

            <div className="container pt-3 scrollable-div">
              {dataMessage.map((item, index) => {
                console.log(item);
                let newChatComponent = <></>;
                if (item.usersId.find((item) => item._id == id)) {
                  newChatComponent = item.messages.map((itemMessage, index) => {
                    console.log(itemMessage);

                    const time = moment(`${itemMessage.createdAt}`);

                    const fixDate = time.format("dddd,D MMMM YYYY");

                    // PERBANDINGAN STRING DI TIME
                    let showTanggal = <></>;
                    if (chatDate !== fixDate) {
                      showTanggal = (
                        <h6 className="font-weight-bold text-center pb-1">
                          {fixDate}
                        </h6>
                      );
                      chatDate = fixDate;
                    }

                    return (
                      <div key={index}>
                        {showTanggal}

                        <Chatcomponent
                          item={itemMessage}
                          // dataMessageApi={messagesApi}
                          DetailChatRecentContact={
                            props.DetailChatRecentContact
                          }
                        />
                      </div>
                    );
                  });
                  return newChatComponent;
                }
                return;
              })}
            </div>
            <div className="d-flex pt-2 px-2 bg-white ">
              <textarea
                name="message"
                rows="2"
                type="text"
                placeholder="Input your message here..."
                className="input-chat"
                value={message}
                onChange={handleChangeMessage}
                required
              />
              <p className="align-self-center my-0 ">
                <i className="far fa-grin-alt h3 px-3 chat-btn" />
              </p>
              <p className="align-self-center my-0 ">
                <i className="fas fa-paperclip h3 chat-btn" />
              </p>
              <p
                style={{ cursor: "pointer" }}
                onClick={() => sendMessage(props.DetailChatRecentContact._id)}
                className="align-self-center my-0"
              >
                <i className="fas fa-arrow-circle-right h3 px-3 chat-btn" />
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
const mapStateToProps = (state) => {
  console.log(state.chatReducer.dataMessage);

  // const newDataMessage = state.chatReducer.dataMessage.find((item) => {
  //   if (id == item.usersId) {
  //     return true;
  //   }
  //   return false;
  // });

  return {
    RecentChatContacts: state.chatReducer.RecentChatContacts,
    DetailChatRecentContact: state.chatReducer.DetailChatRecentContact,
    dataMessage: state.chatReducer.dataMessage,
  };
};

const mapDispatchToProps = {
  showDetailRecentChat,
  addMessage,
  getDataMessage,
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
