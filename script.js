const APP_ID = "390489da3e9847f4b4587c18b0f85e89";
const TOKEN = "007eJxTYPgvczLnlyr3uWmsKx21BTZ4/z9ckLbqc+6jW1LRm5jP5HQpMBhbGphYWKYkGqdaWpiYp5kkmZhamCcbWiQZpFmYplpYBoh+SG8IZGTgnDaBmZEBAkF8boaS1OIS54zEvLzUHAYGAEeMIf0=";
const CHANNEL = "testChannel";
let client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

let localTrack, localAudioTrack;
let remoteUid = null;

async function joinCall() {
  await client.join(APP_ID, CHANNEL, TOKEN, null);

  // Create local tracks
  localTrack = await AgoraRTC.createCameraVideoTrack();
  localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();

  // Play local video
  localTrack.play("local-player");

  // Publish local tracks
  await client.publish([localTrack, localAudioTrack]);

  console.log("Published local tracks");

  // Handle remote user
  client.on("user-published", async (user, mediaType) => {
    await client.subscribe(user, mediaType);
    console.log("Subscribed to remote user:", user.uid);

    if (mediaType === "video") {
      const remoteTrack = user.videoTrack;
      remoteTrack.play("remote-player");
    }

    if (mediaType === "audio") {
      const remoteAudio = user.audioTrack;
      remoteAudio.play();
    }

    remoteUid = user.uid;
  });

  // Handle user leaving
  client.on("user-unpublished", (user) => {
    console.log("Remote user left:", user.uid);
    document.getElementById("remote-player").innerHTML = "";
  });
}

joinCall();

// Mic toggle
let micMuted = false;
function toggleMic() {
  if (!localAudioTrack) return;
  micMuted = !micMuted;
  localAudioTrack.setEnabled(!micMuted);
}

// Camera toggle
let cameraOff = false;
function toggleCamera() {
  if (!localTrack) return;
  cameraOff = !cameraOff;
  localTrack.setEnabled(!cameraOff);
}

// Leave call
async function leaveCall() {
  localTrack.close();
  localAudioTrack.close();
  await client.leave();
  document.getElementById("local-player").innerHTML = "";
  document.getElementById("remote-player").innerHTML = "";
  alert("Left the call");
}