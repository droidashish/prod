import React, { Component } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Grid, Button, Typography } from "@mui/material";
import CreateRoomPage from "./CreateRoomPage";
import MusicPlayer from "./MusicPlayer";

export default function Room({ LeaveCallback }) {
  //  export { updateval };

  // Get the userId param from the URL.
  let { roomCode } = useParams();
  let navigate = useNavigate();

  const [guestCanPause, setguestCanPause] = useState(false);
  const [votesToSkip, setvotesToSkip] = useState(2);
  const [isHost, setisHost] = useState(false);
  const [showSettings, setshowSettings] = useState(false);
  const [spotifyAuthenticated, setspotifyAuthenticated] = useState(false);
  const [song, setsong] = useState({});

  //var updateval;

  function getRoomDetails() {
    fetch("/api/get-room" + "?code=" + roomCode)
      .then((response) => {
        if (!response.ok) {
          LeaveCallback();
          navigate("/");
        }
        return response.json();
      })
      .then((data) => {
        {
          setvotesToSkip(data.votes_to_skip);
          setguestCanPause(data.guest_can_pause);
          setisHost(data.is_host);
        }

        if (isHost) {
          authenticateSpotify();
        }
      });
  }

  getRoomDetails();

  function authenticateSpotify() {
    fetch("/spotify/is-authenticated")
      .then((response) => response.json())
      .then((data) => {
        setspotifyAuthenticated(data.status);
        //  console.log(data.status);
        if (!data.status) {
          fetch("/spotify/get-auth-url")
            .then((response) => response.json())
            .then((data) => {
              window.location.replace(data.url);
            });
        }
      });
  }

  function getCurrentSong() {
    fetch("/spotify/current-song")
      .then((response) => {
        if (!response.ok) {
          //          console.log(7);
          return {};
        } else {
          //console.log(response.text());
          return response.json();
        }
      })
      .then((data) => {
        setsong(data);
        //       console.log(data);
        //     console.log(song);
      });
  }

  getCurrentSong();

  function leaveButtonPressed() {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    };
    fetch("/api/leave-room", requestOptions).then((_response) => {
      LeaveCallback();
      navigate("/");
    });
  }

  function renderSettings() {
    return (
      <Grid container spacing={1}>
        <Grid item xs={12} align="center">
          <CreateRoomPage
            update={true}
            votesToSkip={votesToSkip}
            guestCanPause={guestCanPause}
            roomCode={roomCode}
            updateCallback={() => {}}
          />
        </Grid>
        <Grid item xs={12} align="center">
          <Button
            variant="contained"
            color="secondary"
            onClick={() => setshowSettings(false)}
          >
            Close
          </Button>
        </Grid>
      </Grid>
    );
  }

  function renderSettingsButton() {
    return (
      <Grid item xs={12} align="center">
        <Button
          variant="contained"
          color="primary"
          onClick={() => setshowSettings(true)}
        >
          Settings
        </Button>
      </Grid>
    );
  }

  //updateval = showSettings;

  if (showSettings) {
    return renderSettings();
  } else {
    return (
      <Grid container spacing={1}>
        <Grid item xs={12} align="center">
          <Typography variant="h4" component="h4">
            Code: {roomCode}
          </Typography>
        </Grid>

        <MusicPlayer {...song} />
        {isHost ? renderSettingsButton() : null}

        <Grid item xs={12} align="center">
          <Button
            variant="contained"
            color="secondary"
            onClick={leaveButtonPressed}
          >
            Leave Room
          </Button>
        </Grid>
      </Grid>
    );
  }
}
