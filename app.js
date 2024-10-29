let device;
let server;
let characteristic;
let isConnected = false;

// Funktion zur Verbindung mit dem Bluetooth-Gerät
async function connectToDevice() {
  try {
    const options = {
      acceptAllDevices: true,
      optionalServices: [
        '000018f0-0000-1000-8000-00805f9b34fb', // Custom Data Service für OBD-Kommunikation
        '00001800-0000-1000-8000-00805f9b34fb', // Generic Access
        '0000180a-0000-1000-8000-00805f9b34fb', // Device Information Service
        '0000ffe0-0000-1000-8000-00805f9b34fb'  // UART Service für BLE-Dongle
      ]
    };

    device = await navigator.bluetooth.requestDevice(options);
    console.log("Gerät gefunden:", device.name);

    // GATT-Server-Verbindung herstellen
    server = await device.gatt.connect();
    console.log("Verbunden mit dem GATT-Server");

    // Service und Charakteristik abrufen
    const service = await server.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb');
    characteristic = await service.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb'); // Häufig verwendete Charakteristik für OBD-Daten

    await characteristic.startNotifications();
    characteristic.addEventListener('characteristicvaluechanged', handleData);
    alert("Verbindung hergestellt! OBD-Nachrichten können jetzt gesendet werden.");
    isConnected = true;
  } catch (error) {
    console.error("Fehler:", error);
    alert("Bluetooth-Verbindung konnte nicht hergestellt werden.");
    isConnected = false;
  }
}

// Funktion zur Verarbeitung empfangener Daten
function handleData(event) {
  if (!isConnected) return;
  const value = new TextDecoder().decode(event.target.value);
  console.log("Empfangene Daten:", value);
  addMessageToChat(value, 'device');
}

// Funktion zum Senden einer OBD-Nachricht
async function sendOBDMessage(obdCommand) {
  if (!isConnected) {
    alert("Bitte zuerst eine Verbindung herstellen.");
    return;
  }

  addMessageToChat(obdCommand, 'user');

  const encoder = new TextEncoder();
  await characteristic.writeValue(encoder.encode(obdCommand + '\r'));
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

// Beispiel für eine OBD-Anfrage: "010C" entspricht der Motor-Last in OBD
async function requestEngineRPM() {
  await sendOBDMessage("010C");
}
