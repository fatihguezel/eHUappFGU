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
    const service = await server.getPrimaryService('0000fff0-0000-1000-8000-00805f9b34fb');

    const characteristicsToTest = [
      '0000fff1-0000-1000-8000-00805f9b34fb', // Mögliche Benachrichtigungs-Charakteristik
      '0000fff2-0000-1000-8000-00805f9b34fb'  // Weitere mögliche Charakteristik für Benachrichtigungen
    ];

    for (const charUUID of characteristicsToTest) {
      try {
        characteristic = await service.getCharacteristic(charUUID);
        await characteristic.startNotifications();
        characteristic.addEventListener('characteristicvaluechanged', handleData);

        console.log(`Charakteristik ${charUUID} gefunden und Benachrichtigungen aktiviert`);
        isConnected = true;
        alert("Verbindung hergestellt! Nachrichten können jetzt gesendet werden.");
        break; // Erfolgreiche Charakteristik gefunden
      } catch (error) {
        console.warn(`Charakteristik ${charUUID} nicht geeignet:`, error);
      }
    }

    if (!isConnected) {
      alert("Keine geeignete Charakteristik für Benachrichtigungen gefunden.");
    }
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
    await characteristic.writeValueWithoutResponse(encoder.encode(obdCommand + '\r'));
    console.log("Nachricht gesendet:", obdCommand);
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
