import React, { useEffect, useState } from "react";
import homePicture from "../../assets/text2.png";
import { useParams } from "react-router-dom";
import moment from "moment";
import jwt from "jwt-decode";
import "../style.css";
import Chatcomponent from "./ChatComponent";
import RecentContact from "./RecentContact";
import RecentContact2 from "./RecentContact2";
import UnaddedRecentChat from "./UnaddedContact";
import axios from "axios";

import io from "socket.io-client";

import { Dropdown, DropdownButton, ButtonGroup, Alert } from "react-bootstrap";
import {
  showDetailRecentChat,
  getDataMessage,
  fetchHistoryChat,
  fetchRecentChat,
} from "../../actionCreators/ChatAction";
import { getDataContact } from "../../actionCreators/MainAction";
import { connect } from "react-redux";

const Home = (props) => {
  // when making env, we need to add "REACT_APP" in the first place. it is the rule of react.
  const mainURL = process.env.REACT_APP_API_URL;
  const socketURL = process.env.REACT_APP_API_URL_SOCKET;

  // localhostURL = past url first time socket, for http that is the ip we use (works only on http)
  // const localhostURL = process.env.REACT_APP_LOCALHOST_URL_SOCKET;

  const socket = io(socketURL, {
    transports: ["websocket"],
  });

  // Set the welcome page turn into chat page.
  const [firstShow, setFirstShow] = useState(true);

  // After fetch DataMessage from Message Database, it will be pass to here.
  const [dataMessage, setDataMessage] = useState([]);

  // Use params is used to get id from the URL.
  let { id } = useParams();
  const sender = jwt(localStorage.getItem("token"));
  const senderId = sender.id;

  // Set the message that user input in Textarea Box
  const [message, setMessage] = useState("");

  const [file, setFile] = useState(null);

  const [showAlert, setShowAlert] = useState(false);

  const AlertDismissible = () => {
    if (showAlert) {
      return (
        <Alert variant="danger" onClose={() => setShowAlert(false)} dismissible>
          Please fill the image/document with the right type.
        </Alert>
      );
    }
    return <></>;
  };

  const selectFile = (e) => {
    const imageValidator =
      e.target.files[0].type === "image/gif" ||
      e.target.files[0].type === "image/jpg" ||
      e.target.files[0].type === "image/png" ||
      e.target.files[0].type === "image/jpeg" ||
      e.target.files[0].type === "image/svg" ||
      e.target.files[0].type === "image/webp";

    if (imageValidator) {
      setFile(e.target.files[0]);
    } else {
      return setShowAlert(true);
    }
  };
  const selectDocuments = (e) => {
    const documentValidator =
      // word & excel file
      e.target.files[0].type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      e.target.files[0].type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      e.target.files[0].type === "application/pdf" ||
      e.target.files[0].type === "application/zip" ||
      e.target.files[0].type === "application/rar";

    if (documentValidator) {
      setFile(e.target.files[0]);
    } else {
      return setShowAlert(true);
    }
  };
  const sendDocument = (e) => {
    // check if there is a file or not
    if (file) {
      e.preventDefault();
      setFile(null);
      const fd = new FormData();
      fd.append("documents", file);
      fd.append("senderUserId", sender.id);
      fd.append("targetUserId", id);
      axios
        .post(`${mainURL}/chat/postchat`, fd, {
          headers: {
            "Content-Type": "multipart/form-data",
            "x-access-token": localStorage.getItem("token"),
          },
          onUploadProgress: (progressEvent) => {
            console.log(
              `Upload Progress: ${
                (progressEvent.loaded, progressEvent.total)
              } ${Math.round(
                (progressEvent.loaded / progressEvent.total) * 100
              )} %`
            );
          },
        })
        .then((res) => {
          // console.log(res);
          setFile("");
        })
        .catch((err) => console.log(err));
    } else {
      return setShowAlert(true);
    }
  };
  const sendImage = (e) => {
    // check if there is a file or not
    if (file) {
      e.preventDefault();
      setFile(null);
      const fd = new FormData();
      fd.append("images", file);
      fd.append("senderUserId", sender.id);
      fd.append("targetUserId", id);
      axios
        .post(`${mainURL}/chat/postchat`, fd, {
          headers: {
            "Content-Type": "multipart/form-data",
            "x-access-token": localStorage.getItem("token"),
          },
          onUploadProgress: (progressEvent) => {
            console.log(
              `Upload Progress: ${
                (progressEvent.loaded, progressEvent.total)
              } ${Math.round(
                (progressEvent.loaded / progressEvent.total) * 100
              )} %`
            );
          },
        })
        .then((res) => {
          // console.log(res);
          setFile("");
        })
        .catch((err) => console.log(err));
    } else {
      setShowAlert(true);
    }
  };

  // Set the welcome page turn into chat page, and get the data of the recent chat that is clicked.
  const changeFirstShow = (data) => {
    // console.log(data);
    props.showDetailRecentChat(data);
    props.getDataMessage(data._id);
    setFirstShow(false);
  };

  // Get the message that user Input.
  const handleChangeMessage = (event) => {
    event.preventDefault();
    let { value } = event.currentTarget;
    setMessage(value);
  };

  // User send message to other user.
  const sendMessage = (event) => {
    event.preventDefault();
    // to trim & validate null value with only space
    const messageValidaton = message.trim();

    // VALIDATOR if there are value in message that will be sent
    if (messageValidaton) {
      axios
        .post(
          `${mainURL}/chat/postchat`,
          { senderUserId: senderId, targetUserId: id, message: message },
          { headers: { "x-access-token": localStorage.getItem("token") } }
        )
        .then((value) => {
          // console.log(value.data.messages);
          setMessage("");
          socket.emit("sendMessage", message, () => setMessage(""));
        })
        .catch((err) => console.log(err));
    } else {
      return <> </>;
    }
  };
  // The Search Chat Function (Navbar)
  const SearchContact = (event) => {
    let { value } = event.currentTarget;
    props.fetchHistoryChat(value);
  };

  // In the beginning user open, there will be RecentChats and The Data Contact.
  useEffect(() => {
    props.getDataContact();
    props.fetchHistoryChat("");
    props.fetchRecentChat();
  }, []);

  // When User send Message there will be update/changes.
  useEffect(() => {
    props.fetchRecentChat();
    axios
      .get(`${mainURL}/chat/gettarget/${id}`, {
        headers: { "x-access-token": localStorage.getItem("token") },
      })
      .then((response) => {
        // console.log(response.data);
        setDataMessage(response.data);

        socket.on("sendMessage", (message) => {
          props.getDataMessage(response.data);
          setDataMessage(response.data);
        });
      });
    // why set parameter:
    // props.dataMessage & file(from setFile) = every time user send message gonna update the recentChat
    // firstShow = cover problem every time user go profile and back chat couldn't see the chat.
  }, [props.dataMessage, file, firstShow]);

  let chatDate = undefined;

  // Contact Picture Function
  const contactPic = (picture) => {
    // when you console log you will find out how is the schema of this function
    // console.log(picture);

    const url = process.env.REACT_APP_API_URL;
    const image = `${url}/${picture}`;
    const imageNotFound = `${url}/public/usersImage/default-user-icon.jpg`;
    return {
      backgroundImage: `url(${image}), url(${imageNotFound})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  };

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
                placeholder="Search Chat..."
                onChange={SearchContact}
              />
            </div>
          </div>
        </div>

        <div>
          {/* RecentChatContacts2 = new chat that added by user */}
          {props.RecentChatContacts2.map((item, index) => {
            return (
              <RecentContact2
                item={item}
                key={index}
                changeFirstShow={changeFirstShow}
              />
            );
          })}
        </div>

        <div>
          {/* RecentChatContacts = the chats/recent chats that HAS BEEN CHATTED by User. */}
          {props.RecentChatContacts.map((item, index) => {
            return (
              <RecentContact
                item={item}
                key={index}
                changeFirstShow={changeFirstShow}
                // detailRecentMessages = Pass the username that is fetched in action Creator.
                detailRecentMessages={props.detailRecentMessages}
              />
            );
          })}
        </div>

        <div className="pb-4">
          <h5 className="pt-3 text-center">Unadded Contacts</h5>
          <hr className="bg-light mt-0 w-50" />
          {props.UnaddedRecentChat.map((item, index) => {
            return (
              <UnaddedRecentChat
                item={item}
                key={index}
                changeFirstShow={changeFirstShow}
                // detailRecentMessages = Pass the username that is fetched in action Creator.
                detailRecentMessages={props.detailRecentMessages}
              />
            );
          })}
        </div>
      </div>

      {/* FirstShow Determines "Welcome Page" / "Chat Page" */}
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
              <div
                // The Usage to Read Image that is updated with Real Files (.png, .jpg)
                style={contactPic(props.DetailChatRecentContact.image)}
                alt="..."
                className="rounded-circle img-chat ml-3"
              />
              <h5 className="align-self-center font-weight-bold pl-2 my-0">
                {props.DetailChatRecentContact.username}
              </h5>
            </div>

            <div className="container pt-3 scrollable-div">
              {/* DataMessage = CHATS */}
              {dataMessage.map((item) => {
                let newChatComponent = <></>;
                // IF item.id == id - mengcover agar saat pindah ke user lain data messagenya adalah milik user itu
                // item && item.usersId - mengcover error pada item._id, dmana error bisa terjadi saat si "item"._id ini ngga ada.
                if (item && item.usersId.find((item) => item._id === id)) {
                  newChatComponent = item.messages.map((itemMessage, index) => {
                    // console.log(itemMessage);

                    // USING MOMENT.JS to fetch time from ("2020-05-23T17:15:57.021Z96737066")
                    const time = moment(`${itemMessage.createdAt}`);

                    const fixDate = time.format("dddd,D MMMM YYYY");

                    // CONDITION if the Chat Date is same with Today's Date, then DON'T ADD/SHOW
                    // If DIFFERENT between the Chat Date and Today's Date, then ADD/SHOW.
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
                        {/* The Date */}
                        {showTanggal}

                        {/* The CHATS */}
                        <Chatcomponent
                          item={itemMessage}
                          DetailChatRecentContact={
                            props.DetailChatRecentContact
                          }
                        />
                      </div>
                    );
                  });
                  return newChatComponent;
                }
                return <></>;
              })}
            </div>

            <AlertDismissible />

            <div className="d-flex pt-2 px-2 bg-white justify-content-center">
              <textarea
                id="inputform"
                name="message"
                rows="2"
                type="text"
                placeholder="Input your message here..."
                className="input-chat mr-3"
                value={message}
                onKeyPress={(event) =>
                  event.key === "Enter" ? sendMessage(event) : null
                }
                onChange={handleChangeMessage}
                required
              />

              {/* EMOJI BUTTON */}

              {/* <p className="align-self-center my-0 ">
                <i className="far fa-grin-alt h3 px-3 chat-btn" />
              </p> */}

              {/* ATTACH BUTTON */}
              <div className="align-self-center mb-2">
                {["up"].map((direction) => (
                  <>
                    <DropdownButton
                      as={ButtonGroup}
                      className="send-btn"
                      key={direction}
                      id={`dropdown-button-drop-${direction}`}
                      size="sm"
                      drop={direction}
                      title={<i className="fas fa-paperclip h4 px-2 my-0" />}
                    >
                      <h6 className="my-0 font-weight-bold">Document</h6>
                      <input
                        type="file"
                        // accept is the validator for file extensions
                        accept=".pdf,.docx,.zip,.rar,.xlsx"
                        className="form-control-file"
                        onChange={selectDocuments}
                      />
                      <button
                        className="text-white btn-block mt-2 send-btn"
                        onClick={sendDocument}
                      >
                        Send Document
                      </button>

                      <Dropdown.Divider />
                      <h6 className="my-0 font-weight-bold">Image</h6>
                      <input
                        type="file"
                        accept="image/*"
                        // ref={inputRef}
                        className="form-control-file"
                        onChange={selectFile}
                      />
                      <button
                        className="text-white btn-block mt-2 send-btn"
                        onClick={sendImage}
                      >
                        Send Image
                      </button>
                    </DropdownButton>{" "}
                  </>
                ))}
              </div>

              {/* Usage of Ref */}
              {/* <input type="file"  ref={inputRef} className="form-control-file" onChange={selectFile}/>   */}

              {/* SEND CHAT/MESSAGE BUTTON */}
              <p
                style={{ cursor: "pointer" }}
                onClick={(event) => sendMessage(event)}
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
  // console.log(state);

  return {
    RecentChatContacts: state.chatReducer.RecentChatContacts,
    RecentChatContacts2: state.chatReducer.RecentChatContacts2,
    UnaddedRecentChat: state.chatReducer.UnaddedRecentChat,
    DetailChatRecentContact: state.chatReducer.DetailChatRecentContact,
    dataMessage: state.chatReducer.dataMessage,
    detailRecentMessages: state.chatReducer.detailRecentMessages,
  };
};

const mapDispatchToProps = {
  showDetailRecentChat,
  getDataMessage,
  fetchHistoryChat,
  fetchRecentChat,
  getDataContact,
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
