Bike Trails - Demo (HTML5 Phaser 3)
==================================

Contenuto:
- index.html
- game.js
- style.css

Descrizione:
Prototipo di gioco in HTML5 (Phaser 3). Un uomo su una bici deve superare 10 livelli di sentieri con buche. Ogni livello ha un timer di ~60 secondi.

Come provare su iPad:
1. Scarica e decomprimi il file ZIP.
2. Apri index.html in un editor o caricalo su un server web (per esempio Netlify, GitHub Pages, o un server locale).
3. Su iPad apri Safari e naviga alla pagina (o copia i file sulla cartella di un server locale).
   - Per test locale, puoi usare un piccolo server (python -m http.server 8000) su un computer e accedere dall'iPad tramite la rete locale.

Come trasformarlo in un'app iPad nativa:
- Usa Capacitor (Ionic) o Cordova per impacchettare l'HTML in un'app iOS.
- Poi apri il progetto iOS in Xcode su macOS e firma/compila per iPad.
- Oppure ricorri a un developper iOS per generare un .ipa firmato e distribuirlo tramite TestFlight o App Store.

Licenza:
Questo prototipo è fornito "as-is" per uso dimostrativo. Sentiti libero di modificare il codice.

Note tecniche:
- Nessuna risorsa esterna complessa (tutti i grafici generati al volo).
- Livelli generati proceduralmente con difficoltà crescente.
