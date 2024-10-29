let device;
let server;
let characteristic;
let isConnected = false;
let testerPresentInterval;

async function connectToDevice() {
  // ... (verbleibender Code bleibt gleich)

  for (const charUUID of characteristicsToTest) {
    try {
      characteristic = await service.getCharacteristic(charUUID);
      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', handleData);

      console.log(`Charakteristik ${charUUID} gefunden und Benachrichtigungen aktiviert`);
      isConnected = true;
      startTesterPresent();
      alert("Verbindung hergestellt! Nachrichten können jetzt gesendet werden.");
      break; // Erfolgreiche Charakteristik gefunden
    } catch (error) {
      console.warn(`Charakteristik ${charUUID} nicht geeignet:`, error);
    }
  }
}

function handleData(event) {
  const value = new TextDecoder().decode(event.target.value);
  console.log("Empfangene Daten:", value);
  addMessageToChat(value, 'device'); // Empfangene Daten im Chat anzeigen
}

async function sendMessage() {
  if (!isConnected) {
    alert("Bitte zuerst eine Verbindung herstellen.");
    return;
  }

  const input = document.getElementById('inputMessage');
  const obdCommand = input.value.trim();
  if (!obdCommand) {
    alert("Bitte eine Nachricht eingeben.");
    return;
  }
  input.value = '';

  addMessageToChat(obdCommand, 'user');

  const encoder = new TextEncoder();
  try {
    await characteristic.writeValueWithoutResponse(encoder.encode(obdCommand + '\r'));
    console.log("Nachricht gesendet:", obdCommand);
  } catch (error) {
    console.error("Senden der Nachricht fehlgeschlagen:", error);
  }
}

function startTesterPresent() {
  if (isConnected) {
    testerPresentInterval = setInterval(async () => {
      // Deaktivieren der Benachrichtigungen während des Sendens
      await characteristic.stopNotifications();
      await sendTesterPresent();
      await characteristic.startNotifications(); // Benachrichtigungen wieder aktivieren
    }, 5000);
  }
}

async function sendTesterPresent() {
  try {
    await sendMessage('3E'); // Tester Present
    console.log("Tester Present gesendet");
  } catch (error) {
    console.error("Fehler beim Senden von Tester Present:", error);
  }
}

function stopTesterPresent() {
  if (testerPresentInterval) {
    clearInterval(testerPresentInterval);
    testerPresentInterval = null;
  }
}

function addMessageToChat(message, sender) {
  const messages = document.getElementById('messages');
  const messageElem = document.createElement('div');
  messageElem.className = `message ${sender}`;
  messageElem.textContent = message;
  messages.appendChild(messageElem);
  messages.scrollTop = messages.scrollHeight; // Scrollen zum neuesten Beitrag
}
