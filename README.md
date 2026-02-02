# 🚀 Google Ads Costi Script

Script Google Apps Script per estrarre automaticamente i costi mensili dagli account Google Ads e popolare Google Sheets con interfaccia interattiva per la gestione degli account.

## 📋 Caratteristiche

- ✅ **Estrazione automatica** dei costi mensili da Google Ads
- ✅ **Gestione interattiva account** tramite interfaccia web
- ✅ **Supporto Manager Account** con gerarchia multi-livello
- ✅ **Configurazione dinamica** tramite foglio "Configurazione"
- ✅ **Intervalli date personalizzabili** (mese precedente o date custom)
- ✅ **Gestione errori avanzata** con righe per tutti gli account
- ✅ **Menu personalizzato** per facile gestione
- ✅ **Setup OAuth2 semplificato** con rigenerazione token
- ✅ **Logging ottimizzato** per performance

## 🛠️ Prerequisiti

- Account Google con accesso a Google Sheets
- Account Google Ads Manager con accesso agli account client
- Progetto Google Cloud Platform configurato
- Google Ads API v21 abilitata

## 📚 Setup Completo

Segui i passi nell'ordine. L'OAuth richiede un client **Applicazione web** e un **redirect URI** reale (il flusso "copia codice" OOB è deprecato in Production).

---

### 1. Google Cloud Platform

1. Vai su **[console.cloud.google.com](https://console.cloud.google.com)** e seleziona (o crea) il progetto.
2. **Abilita le API**: APIs & Services → Libreria → cerca e abilita **Google Ads API** e **Google Sheets API**.
3. **Schermata consenso OAuth** (APIs & Services → Schermata consenso OAuth):
   - Tipo utente: **Interno** (se hai Google Workspace) oppure **Esterno** (se usi solo Gmail).
   - Compila nome app, email di supporto, ecc.
   - **Pubblica l'app**: imposta stato di pubblicazione su **In production** (così il refresh token non scade dopo 7 giorni). Per uso solo personale non serve la verifica Google; se vedi "App non verificata" potrai comunque procedere (Avanzate → Vai a …).
4. **Credenziali OAuth 2.0** (APIs & Services → Credenziali):
   - **+ Crea credenziali** → **ID client OAuth**.
   - Tipo applicazione: **Applicazione web** (non "Desktop": il redirect OOB non è più supportato).
   - Nome: es. "Google Ads Costi Script Web".
   - **Origini JavaScript autorizzate**: opzionale; puoi lasciare vuoto o aggiungere `https://script.google.com`.
   - **URI di reindirizzamento autorizzati**: per ora lascia vuoto; li aggiungerai al passo 4 dopo aver distribuito l'App Web.
   - Clicca **Crea** e annota **Client ID** e **Client secret**.

---

### 2. Developer Token Google Ads

1. Vai su **[g.co/adwords/apitoken](https://g.co/adwords/apitoken)**.
2. Compila il form con i dettagli del progetto.
3. Attendi l'approvazione (solitamente 24–48 ore) e copia il **Developer Token** dall'interfaccia admin di Google Ads.

---

### 3. Installazione dello script

1. Apri **Google Sheets** e crea un nuovo foglio (o usa uno esistente).
2. **Estensioni** → **Apps Script**.
3. Nel progetto Apps Script, crea/aggiorna i file con il codice dello script:
   - `config.gs` (configurazione)
   - `google-ads-costs-script.gs` (logica principale)
   - `utilities.gs` (menu, OAuth, utilità)

4. In **config.gs** imposta subito (REFRESH_TOKEN e REDIRECT_URI li aggiungerai ai passi 5 e 6):

```javascript
const API_CONFIG = {
  DEVELOPER_TOKEN: 'IL_TUO_DEVELOPER_TOKEN',
  CLIENT_ID: 'IL_TUO_CLIENT_ID',           // dal client "Applicazione web"
  CLIENT_SECRET: 'IL_TUO_CLIENT_SECRET',
  REFRESH_TOKEN: '',                       // lo otterrai al passo 6
  REDIRECT_URI: ''                         // lo imposti al passo 4 dopo il deploy
};
```

Salva il progetto (Ctrl+S).

---

### 4. Distribuzione Web App e Redirect URI

Lo script usa un redirect reale (URL della Web App); l'URL va aggiunto in Google Cloud e in `config.gs`.

1. **Distribuisci come App Web** (in Apps Script):
   - **Deploy** → **Nuova distribuzione**.
   - Clicca sull'ingranaggio accanto a "Seleziona tipo" → **App Web**.
   - **Descrizione**: es. "OAuth callback".
   - **Esegui come**: Io.
   - **Chi può accedere**: **Chiunque** (obbligatorio: con "Solo io" il redirect dopo l'autorizzazione mostra "Impossibile aprire il file").
   - **Distribuisci** e **copia l'URL dell'app** (es. `https://script.google.com/macros/s/AKfycbw.../exec`).

2. **Aggiungi l'URI in Google Cloud**:
   - Console GCP → **Credenziali** → apri il client OAuth **Applicazione web**.
   - **URI di reindirizzamento autorizzati** → **Aggiungi URI** → incolla **esattamente** l'URL copiato (nessuno spazio, nessuna barra finale) → **Salva**.

3. **Redirect URI in config.gs**:
   - In `config.gs` imposta `API_CONFIG.REDIRECT_URI` con lo **stesso** URL dell'app (così lo script e GCP usano lo stesso valore).

4. **Verifica**: dal foglio, menu **Google Ads Costi** → **OAuth2 Setup** → **Mostra Redirect URI**. L'URL mostrato deve essere identico a quello in GCP.

### 5. Ottenere il Refresh Token

1. Dal foglio: menu **Google Ads Costi** → **OAuth2 Setup** → **Rigenera Refresh Token**.
2. Apri nel browser l'URL mostrato nel dialog.
3. Autorizza l'app (se compare "App non verificata", clicca **Avanzate** → **Vai a … (non sicuro)**).
4. Dopo l'autorizzazione verrai reindirizzato alla pagina dello script: clicca **Ottieni Refresh Token**.
5. Copia il **Refresh Token** mostrato.
6. In Apps Script apri **config.gs**, incolla il valore in `API_CONFIG.REFRESH_TOKEN` e **salva**.

**Non serve rifare il deploy** dopo aver aggiornato il refresh token: le esecuzioni dal foglio (e i trigger) usano sempre il codice salvato nell'editor.

**Se compare "Funzione script non trovata: doGet"**: crea una **nuova distribuzione** (Deploy → Nuova distribuzione → App Web, "Chiunque"), aggiorna l'URL in GCP e in `REDIRECT_URI`, poi ripeti dal punto 1.

---

### 6. Configurazione account (interattiva)

1. Dal foglio: menu **Google Ads Costi** → **Seleziona Account**.
2. Seleziona con le checkbox gli account da monitorare e salva.
3. Verrà creata/aggiornata la tab **Configurazione** con i Customer ID e i nomi account.

---

### 7. Trigger (schedulazione)

1. In Apps Script: **Trigger** (icona orologio) → **+ Aggiungi trigger**.
2. **Funzione**: `estraiCostiMensili` | **Evento**: Time-driven | **Tipo**: Month timer | **Giorno**: 1 | **Ora**: 9:00 → Salva.
3. **(Opzionale)** Trigger giornaliero per `mantieniRefreshTokenAttivo` (es. 8:00). In Production non è obbligatorio ma consigliato.

## 🚀 Utilizzo

### Funzioni Principali

| Funzione | Descrizione | Uso |
|----------|-------------|-----|
| `estraiCostiMensili()` | Estrae i costi del periodo configurato | **Principale** - da schedulare |
| `selezionaAccountInterattivo()` | Interfaccia per selezionare account | Configurazione iniziale |
| `configuraIntervalloDate()` | Configura periodo di estrazione | Personalizzazione date |

### Menu Personalizzato

Lo script crea automaticamente un menu "🚀 Google Ads Costi" con:

#### 🔑 OAuth2 Setup
- **Rigenera Refresh Token** - Avvia il flusso OAuth e ottieni il refresh token
- **Converti Codice in Refresh Token** - Usa il codice salvato dal redirect (se non hai cliccato "Ottieni Refresh Token" sulla pagina)
- **Mostra Redirect URI** - Mostra l'URL da aggiungere in Google Cloud (per evitare redirect_uri_mismatch)
- **Test Connessione OAuth** / **Verifica Stato Refresh Token** / **Mantieni Token Attivo**

#### 📊 Gestione Account
- **Seleziona Account** - Interfaccia per configurare account

#### 📅 Configurazione Date
- **Configura Intervallo Date** - Personalizza periodo estrazione
- **Mostra Date Configurate** - Verifica configurazione attuale

#### 📊 Estrazione Dati
- **Estrai Costi Mensili** - Esecuzione principale

### Schedulazione

1. **In Apps Script**, vai su "Trigger" (icona orologio)
2. **Crea nuovo trigger**:
   - Funzione: `estraiCostiMensili`
   - Evento: "Time-driven"
   - Tipo: "Month timer"
   - Giorno: 1 (primo del mese)
   - Ora: 9:00 AM

## 📊 Struttura Dati

### Foglio "Costi Google Ads"

| Colonna | Nome | Tipo | Descrizione |
|---------|------|------|-------------|
| A | Data Estrazione | Timestamp | Quando i dati sono stati estratti |
| B | Customer ID | String | ID univoco dell'account Google Ads |
| C | Nome Account | String | Nome descrittivo dell'account |
| D | Mese | String | Periodo in formato YYYY-MM |
| E | Costo (EUR) | Number | Costo totale del mese in euro |

### Foglio "Configurazione"

| Colonna | Nome | Descrizione |
|---------|------|-------------|
| A | Customer ID | ID degli account selezionati |
| B | Nome Account | Nome descrittivo degli account |

## 🔧 Configurazione Avanzata

### Intervalli Date

```javascript
// In config.gs
DATE_RANGE: {
  USE_PREVIOUS_MONTH: true,        // true = mese precedente, false = date custom
  CUSTOM_START_DATE: '2025-08-01', // Data inizio (se USE_PREVIOUS_MONTH = false)
  CUSTOM_END_DATE: '2025-08-31'    // Data fine (se USE_PREVIOUS_MONTH = false)
}
```

### Gestione Errori

Lo script gestisce automaticamente:
- **Account senza costi** → Righe con 0€ per tutti i mesi del periodo
- **Account con errori** → Righe con 0€ e log dell'errore
- **Mesi mancanti** → Genera automaticamente tutti i mesi del periodo

## 🔧 Troubleshooting

### Errori Comuni

| Errore | Causa | Soluzione |
|--------|-------|-----------|
| "Configurazione errata: CUSTOMER_IDS non definito" | Nessun account configurato | Usa "Seleziona Account" dal menu |
| "invalid_grant" | Refresh token scaduto | Usa "Rigenera Refresh Token" (dopo aver configurato Redirect URI) |
| "400: invalid_request" / OOB deprecato | App in Production con redirect OOB | Usa client **Applicazione web** e Redirect URI (vedi Setup passo 4) |
| "400: redirect_uri_mismatch" | L'URL usato dallo script non coincide con GCP | Menu **Mostra Redirect URI**: copia l'URL mostrato e aggiungilo in GCP (identico). Imposta `REDIRECT_URI` in config.gs con lo stesso URL. |
| "Impossibile aprire il file" dopo l'auth | Web App con accesso "Solo io" | Deploy → Gestisci distribuzioni → Modifica App Web → **Chi può accedere**: **Chiunque** |
| "Funzione script non trovata: doGet" | Distribuzione Web App con versione vecchia | Deploy → **Nuova distribuzione** → App Web (stesso tipo, Chiunque), copia il nuovo URL, aggiorna GCP e `REDIRECT_URI`, poi ripeti Rigenera Refresh Token |
| "HTTP 403" | Permessi insufficienti | Verifica Manager Account ID |
| "HTTP 404" | Endpoint API errato | Verifica versione API (v21) |

### Gestione Refresh Token

**Cause comuni di scadenza refresh token:**
- **Non utilizzato per 6 mesi** (più comune)
- **Utente ha revocato l'accesso** all'app
- **Utente ha cambiato password**
- **Limite di 100 refresh token** per account raggiunto
- **Politiche amministrative** attive

**Test Pre-Schedulazione:**
1. Esegui "🧪 Test Connessione OAuth" dal menu
2. Verifica che tutti i test passino
3. Solo dopo configura il trigger automatico

**Keep-Alive Refresh Token (Raccomandato):**
Per evitare scadenze del refresh token, configura un trigger giornaliero:
1. **Crea trigger giornaliero** per `mantieniRefreshTokenAttivo`
2. **Frequenza**: Una volta al giorno (es. 8:00 AM)
3. **Risultato**: Il refresh token rimane sempre attivo

**Notifica Automatica:**
Se il refresh token scade (nonostante il keep-alive), riceverai automaticamente un'email di notifica con le istruzioni per rigenerarlo. Questo ti permette di intervenire tempestivamente prima che lo script mensile fallisca.

### Log e Debug

- **Controlla i log** in Apps Script > Esecuzioni
- **Verifica la configurazione** con "Mostra Date Configurate"
- **Controlla account configurati** con il foglio "Configurazione"

## 📈 Integrazione Looker Studio

1. **In Looker Studio**, crea nuovo report
2. **Aggiungi origine dati** > Google Sheets
3. **Seleziona il foglio** "Costi Google Ads"
4. **Configura le dimensioni**:
   - Mese (per trend temporali)
   - Nome Account (per segmentazione)
   - Customer ID (per filtri avanzati)
5. **Configura le metriche**:
   - Costo (EUR) per totali e medie
   - Conteggio record per frequenza

## 🔒 Sicurezza

- **Non condividere** mai le credenziali API
- **Usa account dedicati** per le API
- **Limita gli scope** OAuth al minimo necessario
- **Monitora l'uso** delle API per evitare abusi
- **Configurazione salvata** solo nel tuo Google Sheet

## 📝 Note Tecniche

- **API Version**: Google Ads API v21
- **Rate Limiting**: Ottimizzato per chiamate rapide
- **Gestione Errori**: Righe per tutti gli account (anche con errori)
- **Completezza Dati**: Tutti i mesi del periodo sempre presenti
- **Performance**: Access token condiviso per tutte le chiamate
- **Configurazione Dinamica**: Gestita tramite interfaccia web

## 🆕 Changelog

### v2.0 (Attuale)
- ✅ Interfaccia interattiva per selezione account
- ✅ Configurazione dinamica tramite foglio "Configurazione"
- ✅ Intervalli date personalizzabili
- ✅ Gestione errori avanzata con righe per tutti gli account
- ✅ Setup OAuth2 semplificato
- ✅ Performance ottimizzate
- ✅ Codice pulito senza duplicazioni

### v1.0 (Precedente)
- Estrazione base costi mensili
- Configurazione hardcoded
- Gestione errori base

## 🤝 Supporto

Questo script è fornito "as-is" per uso personale e aziendale. Non garantisce l'accuratezza dei dati estratti o la compatibilità 
con future versioni delle API Google Ads.

Per problemi o domande:
1. **Controlla i log** di Apps Script
2. **Verifica la configurazione** con le funzioni del menu
3. **Controlla la documentazione** Google Ads API v21
4. **Verifica i permessi** dell'account Google Ads

## 📄 Licenza

Questo progetto è rilasciato sotto licenza MIT. Vedi il file [LICENSE](LICENSE) per i dettagli completi.

**In breve:** Puoi usare, modificare e distribuire liberamente questo software per uso personale e commerciale.

---

**🚀 Pronto per l'uso!** Configura le credenziali, seleziona gli account e inizia a estrarre i tuoi dati Google Ads con un'interfaccia moderna e intuitiva.