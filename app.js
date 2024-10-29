let device;
let server;
let characteristicNotify;
let characteristicWrite;
let isConnected = false;

async function connectToDevice() {
  try {
    const options = {
      acceptAllDevices: true,
      optionalServices: ['0000fff0-0000-1000-8000-00805f9b34fb']
    };

    device = await navigator.bluetooth.requestDevice(options);
    console.log("Gerät gefunden:", device.name);

    server = await device.gatt.connect();
    const service = await server.getPrimaryService('0000fff0-0000-1000-8000-00805f9b34fb');

    // Charakteristiken `FFF1` für Benachrichtigungen und `FFF2` zum Schreiben
    characteristicNotify = await service.getCharacteristic('0000fff1-0000-1000-8000-00805f9b34fb');
    await characteristicNotify.startNotifications();
    characteristicNotify.addEventListener('characteristicvaluechanged', handleData);

    characteristicWrite = await service.getCharacteristic('0000fff2-0000-1000-8000-00805f9b34fb');

    console.log("Benachrichtigungen auf `FFF1` aktiviert und `FFF2` für das Schreiben konfiguriert.");
    isConnected = true;
    alert("Verbindung hergestellt! Nachrichten können jetzt gesendet werden.");
  } catch (error) {
    console.error("Verbindungsfehler:", error);
    isConnected = false;
  }
}

function handleData(event) {
  const value = new TextDecoder().decode(event.target.value);
  console.log("Empfangene Daten:", value);
  addMessageToChat(value, 'device');
}

async function sendMessage(obdCommand) {
  if (!isConnected) {
    alert("Bitte zuerst eine Verbindung herstellen.");
    return;
  }

  if (!obdCommand) {
    console.error("Kein gültiger Befehl zum Senden.");
    return;
  }

  const encoder = new TextEncoder();
  try {
    await characteristicWrite.writeValueWithoutResponse(encoder.encode(obdCommand + '\r'));
    console.log("Nachricht gesendet:", obdCommand);
    addMessageToChat(obdCommand, 'user');
  } catch (error) {
    console.error("Senden der Nachricht fehlgeschlagen:", error);
  }
}

function addMessageToChat(message, sender) {
  const messages = document.getElementById('messages');
  const messageElem = document.createElement('div');
  messageElem.className = `message ${sender}`;
  messageElem.textContent = message;
  messages.appendChild(messageElem);
  messages.scrollTop = messages.scrollHeight;
}
