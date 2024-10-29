let device;
let server;
let characteristic;
let isConnected = false;
let testerPresentInterval;

// Verbindung herstellen
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

    // Zugriff auf FFF1-Charakteristik
    characteristic = await service.getCharacteristic('0000fff1-0000-1000-8000-00805f9b34fb');
    await characteristic.startNotifications();
    characteristic.addEventListener('characteristicvaluechanged', handleData);

    alert("Verbindung hergestellt! Nachrichten können jetzt gesendet werden.");
    isConnected = true;

    // Beginne "Tester Present"-Nachrichten zu senden
    startTesterPresent();
  } catch (error) {
    console.error("Verbindungsfehler:", error);
    isConnected = false;
  }
}

// Funktion zum Senden der "Tester Present"-Nachricht
function startTesterPresent() {
  if (isConnected) {
    testerPresentInterval = setInterval(() => {
      sendMessage('3E');  // 3E ist der OBD-II-Befehl für "Tester Present"
      console.log("Tester Present gesendet");
    }, 5000);  // alle 5 Sekunden
  }
}

// Funktion zum Stoppen der "Tester Present"-Nachrichten
function stopTesterPresent() {
  if (testerPresentInterval) {
    clearInterval(testerPresentInterval);
    testerPresentInterval = null;
  }
}

// Funktion zur Verarbeitung empfangener Daten
function handleData(event) {
  const value = new TextDecoder().decode(event.target.value);
  console.log("Empfangene Daten:", value);
}

// Senden von Daten
async function sendMessage(message) {
  if (isConnected) {
    const encoder = new TextEncoder();
    await characteristic.writeValue(encoder.encode(message + '\r'));
  }
}

// Bei Verbindungsende sicherstellen, dass das Intervall beendet wird
device.addEventListener('gattserverdisconnected', stopTesterPresent);
