let device;
let server;
let characteristic;
let isConnected = false;

// Funktion zur Bluetooth-Verbindung mit dem Gerät
async function connectToDevice() {
  try {
    const options = { acceptAllDevices: true }; // Zeigt alle BLE-Geräte an
    device = await navigator.bluetooth.requestDevice(options);
    console.log("Gerät gefunden:", device.name);

    server = await device.gatt.connect();
    console.log("Verbunden mit dem GATT-Server");

    // Service und Charakteristik abrufen
    const service = await server.getPrimaryService('battery_service'); // UUID anpassen
    characteristic = await service.getCharacteristic('battery_level'); // UUID anpassen

    await characteristic.startNotifications();
    characteristic.addEventListener('characteristicvaluechanged', handleData);
    alert("Verbindung hergestellt! Nachrichten können jetzt gesendet werden.");
    isConnected = true;
  } catch (error) {
    console.error("Fehler:", error);
    alert("Bluetooth-Verbindung konnte nicht hergestellt werden.");
    isConnected = false;
  }
}

// Funktion zur Datenverarbeitung
function handleData(event) {
  if (!isConnected) return;
  const value = new TextDecoder().decode(event.target.value);
  console.log("Empfangene Daten:", value);
  addMessageToChat(value, 'device');
}

// Funktion zum Senden einer Nachricht
async function sendMessage() {
  if (!isConnected) {
    alert("Bitte zuerst eine Verbindung herstellen.");
    return;
  }

  const input = document.getElementById('inputMessage');
  const message = input.value;
  input.value = '';

  addMessageToChat(message, 'user');

  const encoder = new TextEncoder();
  await characteristic.writeValue(encoder.encode(message + '\r'));
}

// Funktion zur Anzeige von Nachrichten im Chat
function addMessageToChat(message, sender) {
  const messages = document.getElementById('messages');
  const messageElem = document.createElement('div');
  messageElem.className = `message ${sender}`;
  messageElem.textContent = message;
  messages.appendChild(messageElem);
  messages.scrollTop = messages.scrollHeight;
}
