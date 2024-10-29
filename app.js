let device;
let server;
let characteristic;
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
    console.log("Verbunden mit dem GATT-Server");

    const service = await server.getPrimaryService('0000fff0-0000-1000-8000-00805f9b34fb');
    
    try {
      characteristic = await service.getCharacteristic('0000fff1-0000-1000-8000-00805f9b34fb');
      console.log("Charakteristik fff1 gefunden und für Benachrichtigungen aktiviert");

      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', handleData);

      alert("Verbindung hergestellt! Nachrichten können jetzt gesendet werden.");
      isConnected = true;
    } catch (error) {
      console.error("Charakteristik fff1 nicht gefunden, versuche ae3b:", error);

      try {
        characteristic = await service.getCharacteristic('0000ae3b-0000-1000-8000-00805f9b34fb');
        console.log("Charakteristik ae3b gefunden und für Benachrichtigungen aktiviert");

        await characteristic.startNotifications();
        characteristic.addEventListener('characteristicvaluechanged', handleData);

        alert("Verbindung hergestellt! Nachrichten können jetzt gesendet werden.");
        isConnected = true;
      } catch (error) {
        console.error("Keine passende Charakteristik gefunden:", error);
        alert("OBD-Dongle unterstützt keine kompatible Kommunikationscharakteristik.");
      }
    }
  } catch (error) {
    console.error("Fehler:", error);
    alert("Bluetooth-Verbindung konnte nicht hergestellt werden.");
    isConnected = false;
  }
}

function handleData(event) {
  if (!isConnected) return;
  const value = new TextDecoder().decode(event.target.value);
  console.log("Empfangene Daten:", value);
  addMessageToChat(value, 'device');
}

async function sendMessage() {
  if (!isConnected) {
    alert("Bitte zuerst eine Verbindung herstellen.");
    return;
  }

  const input = document.getElementById('inputMessage');
  const obdCommand = input.value;
  input.value = '';

  addMessageToChat(obdCommand, 'user');

  const encoder = new TextEncoder();
  await characteristic.writeValue(encoder.encode(obdCommand + '\r'));
}

function addMessageToChat(message, sender) {
  const messages = document.getElementById('messages');
  const messageElem = document.createElement('div');
  messageElem.className = `message ${sender}`;
  messageElem.textContent = message;
  messages.appendChild(messageElem);
  messages.scrollTop = messages.scrollHeight;
}
