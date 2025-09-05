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

### 1. Configurazione Google Cloud Platform

1. **Vai su [console.cloud.google.com](https://console.cloud.google.com)**
2. **Crea un nuovo progetto** o seleziona quello esistente
3. **Abilita le API**:
   - Google Ads API
   - Google Sheets API
4. **Crea credenziali OAuth 2.0**:
   - Tipo: "Desktop app"
   - Nome: "Google Ads Costi Script"
5. **Scarica il file JSON** delle credenziali

### 2. Richiesta Developer Token

1. **Vai su [g.co/adwords/apitoken](https://g.co/adwords/apitoken)**
2. **Compila il form** con i dettagli del tuo progetto
3. **Attendi l'approvazione** (solitamente 24-48 ore)
4. **Ricevi il Developer Token** nell'interfaccia admin di Google Ads

### 3. Installazione Script

1. **Apri Google Sheets** e crea un nuovo foglio
2. **Vai su Estensioni > Apps Script**
3. **Copia i file dello script** nei file del progetto:
   - `config.gs` (configurazione principale)
   - `google-ads-costs-script.gs` (file principale)
   - `utilities.gs` (funzioni di supporto e OAuth)

### 4. Configurazione Credenziali

Nel file `config.gs`, aggiorna la sezione `API_CONFIG`:

```javascript
const API_CONFIG = {
  DEVELOPER_TOKEN: 'IL_TUO_DEVELOPER_TOKEN',
  CLIENT_ID: 'IL_TUO_CLIENT_ID',
  CLIENT_SECRET: 'IL_TUO_CLIENT_SECRET',
  REFRESH_TOKEN: 'IL_TUO_REFRESH_TOKEN'
};
```

**Per ottenere il Refresh Token:**
1. Esegui la funzione "🔑 OAuth2 Setup > Rigenera Refresh Token" dal menu
2. Segui le istruzioni per autorizzare l'app
3. Copia il refresh token generato

### 5. Configurazione Account (Interattiva)

**Non più necessario configurare manualmente i Customer ID!**

1. **Esegui "📊 Seleziona Account"** dal menu personalizzato
2. **Seleziona gli account** che vuoi monitorare tramite checkbox
3. **Salva la configurazione** - verrà creata automaticamente la tab "Configurazione"

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
- **Rigenera Refresh Token** - Setup iniziale OAuth2
- **Converti Codice in Refresh Token** - Conversione manuale

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
| "invalid_grant" | Refresh token scaduto | Usa "Rigenera Refresh Token" |
| "HTTP 403" | Permessi insufficienti | Verifica Manager Account ID |
| "HTTP 404" | Endpoint API errato | Verifica versione API (v21) |

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