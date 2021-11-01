import React, { Fragment, useState, useEffect, useRef } from "react";
import {
  Header,
  Loader, Icon, Grid, Segment, Button, Input,
} from "semantic-ui-react";
import SweetAlert from "react-bootstrap-sweetalert";

const Chat = ({ connection, updateConnection, channel, updateChannel }) => {
  const webSocket = useRef(null);
  const [socketOpen, setSocketOpen] = useState(false);
  const [socketMessages, setSocketMessages] = useState([]);
  const [alert, setAlert] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [name, setName] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [connectedTo, setConnectedTo] = useState("");
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
// add the websocket url to env in production environment     
     webSocket.current = new WebSocket("ws://localhost:9000");
     webSocket.current.onmessage = message => {
       const data = JSON.parse(message.data);
       setSocketMessages(prev => [...prev, data]);
      };
      
      webSocket.current.onclose = () => {
        webSocket.current.close();
      };
      return () => webSocket.current.close();
    }, []);

    useEffect(() => {
      let data = socketMessages.pop();
      if (data) {
        switch (data.type) {
          case "connect":
            setSocketOpen(true);
            break;
          case "login":
            onLogin(data);
            break;
          // case "updateUsers":
          //   updateUsersList(data);
          //   break;
          // case "removeUser":
          //   removeUser(data);
          //   break;
          // case "offer":
          //   onOffer(data);
          //   break;
          // case "answer":
          //   onAnswer(data);
          //   break;
          // case "candidate":
          //   onCandidate(data);
          //   break;
          default:
            break;
        }
      }
    }, [socketMessages]);

    const send = data => {
      webSocket.current.send(JSON.stringify(data));
    };

    const onLogin = ({ success, message, users: loggedIn }) => {
      setLoggingIn(false);
      if (success) {
        setAlert(
          <SweetAlert
            success
            title="Success!"
            // onConfirm={closeAlert}
            // onCancel={closeAlert}
          >
            Logged in successfully!
          </SweetAlert>
        );
        setIsLoggedIn(true);
        setUsers(loggedIn);
      } else {
        setAlert(
          <SweetAlert
            warning
            confirmBtnBsStyle="danger"
            title="Failed"
            // onConfirm={closeAlert}
            // onCancel={closeAlert}
          >
            {message}
          </SweetAlert>
        );
      }
    };

    const handleLogin = () => {
      setLoggingIn(true);
      send({
        type: "login",
        name
      });
    };
    
    return (
    <div className="App">
      {alert}
      <Header as="h2" icon className="header">
        <Icon name="users" />
        Simple WebRTC Chap App
      </Header>
      {(socketOpen && (
        <Fragment>
          <Grid centered columns={4}>
            <Grid.Column>
              {(!isLoggedIn && (
                <Input
                  fluid
                  disabled={loggingIn}
                  type="text"
                  onChange={e => setName(e.target.value)}
                  placeholder="Username..."
                  action
                >
                  <input />
                  <Button
                    color="teal"
                    disabled={!name || loggingIn}
                    onClick={handleLogin}
                  >
                    <Icon name="sign-in" />
                    Login
                  </Button>
                </Input>
              )) || (
                <Segment raised textAlign="center" color="olive">
                  Logged In as: {name}
                </Segment>
              )}
            </Grid.Column>
          </Grid>
        </Fragment>
      )) || (
        <Loader size="massive" active inline="centered">
          Loading
        </Loader>
      )}
    </div>
  );
};
export default Chat;