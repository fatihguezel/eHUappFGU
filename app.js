let device;
let server;
let characteristic;
let isConnected = false;
let testerPresentInterval;

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
    
    // Liste möglicher Charakteristiken
    const characteristicsToTest = [
      '0000fff1-0000-1000-8000-00805f9b34fb',
      '0000fff2-0000-1000-8000-00805f9b34fb',
      '0000ae01-0000-1000-8000-00805f9b34fb',
      '0000ae02-0000-1000-8000-00805f9b34fb'
    ];

    for (const charUUID of characteristicsToTest) {
      try {
        characteristic = await service.getCharacteristic(charUUID);
        await characteristic.startNotifications();
        characteristic.addEventListener('characteristicvaluechanged', handleData);

        console.log(`Charakteristik ${charUUID} gefunden und Benachrichtigungen aktiviert`);
        isConnected = true;
        startTesterPresent();
        alert("Verbindung hergestellt! Nachrichten können jetzt gesendet werden.");
        break; // Erfolgreiche Charakteristik gefunden, Schleife beenden
      } catch (error) {
        console.warn(`Charakteristik ${charUUID} nicht geeignet:`, error);
      }
    }

    if (!isConnected) {
      alert("Keine geeignete Charakteristik gefunden.");
    }
  } catch (error) {
    console.error("Verbindungsfehler:", error);
    isConnected = false;
  }
}

// Empfangen von Daten
function handleData(event) {
  const value = new TextDecoder().decode(event.target.value);
  console.log("Empfangene Daten:", value);
}

// Nachricht senden (OBD-Befehl)
async function sendMessage(message) {
  if (isConnected) {
    const encoder = new TextEncoder();
    try {
      await characteristic.writeValueWithoutResponse(encoder.encode(message + '\r'));
      console.log("Nachricht gesendet:", message);
    } catch (error) {
      console.error("Senden der Nachricht fehlgeschlagen:", error);
    }
  } else {
    alert("Bitte zuerst eine Verbindung herstellen.");
  }
}

// "Tester Present"-Nachricht, um Verbindung aufrechtzuerhalten
function startTesterPresent() {
  if (isConnected) {
    testerPresentInterval = setInterval(() => {
      sendMessage('3E'); // Tester Present
      console.log("Tester Present gesendet");
    }, 5000);
  }
}

// Intervall bei Verbindungsabbruch stoppen
function stopTesterPresent() {
  if (testerPresentInterval) {
    clearInterval(testerPresentInterval);
    testerPresentInterval = null;
  }
}
