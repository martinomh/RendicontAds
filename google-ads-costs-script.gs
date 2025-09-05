/**
 * Google Ads Costi Mensili - Script per Google Sheets
 * Estrae i costi mensili dagli account Google Ads specificati
 * 
 * Configurazione richiesta:
 * - Google Ads API v14
 * - OAuth 2.0 credentials
 * - Developer Token
 */

// CONFIGURAZIONE - MODIFICA I VALORI NEL FILE config.gs
// Questo file importa automaticamente le configurazioni da config.gs

/**
 * Funzione principale da eseguire manualmente o schedulare
 * Estrae i costi del mese precedente per tutti gli account configurati
 */
function estraiCostiMensili() {
  try {
    console.log('🚀 Inizio estrazione costi mensili...');
    
    // La configurazione viene verificata durante la lettura dal foglio "Configurazione"
    
    // Ottieni il foglio di destinazione
    const sheet = getSheetDestinazione();
    if (!sheet) {
      console.error('❌ Impossibile accedere al foglio di destinazione');
      return;
    }
    
    // Calcola il periodo (mese precedente)
    const periodo = calcolaPeriodoDate();
    console.log(`📅 Estraendo dati per il periodo: ${periodo.inizio} - ${periodo.fine}`);
    
    // Estrai dati per ogni account
    let totaleRigheAggiunte = 0;
    
    // Leggi la configurazione dalla tab "Configurazione"
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const configSheet = spreadsheet.getSheetByName('Configurazione');
    
    if (!configSheet) {
      throw new Error('❌ Nessun account configurato! Usa il menu "📊 Gestione Account" → "☑️ Seleziona Account" per selezionare gli account da monitorare.');
    }
    
    const data = configSheet.getDataRange().getValues();
    if (data.length <= 1) {
      throw new Error('❌ Nessun account configurato! Usa il menu "📊 Gestione Account" → "☑️ Seleziona Account" per selezionare gli account da monitorare.');
    }
    
    // Estrai gli account dalla tab
    const customerIds = data.slice(1).map(row => row[0]);
    const accountNames = {};
    data.slice(1).forEach(row => {
      accountNames[row[0]] = row[1];
    });
    
    console.log(`📋 Account configurati: ${customerIds.join(', ')}`);
    
    // Aggiorna la configurazione in memoria
    CONFIG.CUSTOMER_IDS = customerIds;
    CONFIG.ACCOUNT_NAMES = accountNames;
    
    // Ottieni l'access token una sola volta per tutte le chiamate
    const accessToken = ottieniAccessToken();
    if (!accessToken) {
      throw new Error('❌ Impossibile ottenere access token');
    }
    
    for (const customerId of CONFIG.CUSTOMER_IDS) {
      try {
    
        
        const datiAccount = estraiDatiAccount(customerId, periodo, accessToken);
        if (datiAccount && datiAccount.length > 0) {
          const righeAggiunte = aggiungiDatiAlFoglio(sheet, datiAccount);
          totaleRigheAggiunte += righeAggiunte;
          
          // Log unificato con nome account e costo totale
          const accountName = (CONFIG.ACCOUNT_NAMES && CONFIG.ACCOUNT_NAMES[customerId]) || `Account ${customerId}`;
          const costo = datiAccount.reduce((totale, riga) => totale + riga.cost, 0);
          const costoFormattato = costo > 0 ? `${costo.toFixed(2)}€` : '0.00€';
          console.log(`✅ Account ${customerId} (${accountName}): ${costoFormattato} - aggiunte ${righeAggiunte} righe`);
        }
        
        // Nessuna pausa - le API Google Ads possono gestire chiamate rapide
        
      } catch (error) {
        console.error(`❌ Errore nell'elaborazione account ${customerId}:`, error);
        
        // Aggiungi una riga di errore anche per errori di livello superiore
        const accountName = (CONFIG.ACCOUNT_NAMES && CONFIG.ACCOUNT_NAMES[customerId]) || `Account ${customerId}`;
        const datiErrore = [{
          customerId: customerId,
          accountName: accountName,
          month: periodo.inizio.substring(0, 7),
          cost: 0
        }];
        
        const righeAggiunte = aggiungiDatiAlFoglio(sheet, datiErrore);
        totaleRigheAggiunte += righeAggiunte;
        console.log(`❌ Account ${customerId} (${accountName}): 0.00€ - aggiunte ${righeAggiunte} righe`);
      }
    }
    
    console.log(`🎉 Estrazione completata! Aggiunte ${totaleRigheAggiunte} righe totali`);
    
  } catch (error) {
    console.error('❌ Errore generale durante l\'estrazione:', error);
    throw error;
  }
}

/**
 * Ottiene o crea il foglio di destinazione
 */
function getSheetDestinazione() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME);
  
  if (!sheet) {
    console.log(`📝 Creo nuovo foglio: ${CONFIG.SHEET_NAME}`);
    sheet = spreadsheet.insertSheet(CONFIG.SHEET_NAME);
    configurazioneInizialeFoglio(sheet);
  }
  
  return sheet;
}

/**
 * Configurazione iniziale del foglio con intestazioni
 */
function configurazioneInizialeFoglio(sheet) {
  const intestazioni = [
    CONFIG.TIMESTAMP_COLUMN,
    CONFIG.CUSTOMER_ID_COLUMN,
    CONFIG.ACCOUNT_NAME_COLUMN,
    CONFIG.MONTH_COLUMN,
    CONFIG.COST_COLUMN
  ];
  
  sheet.getRange(1, 1, 1, intestazioni.length).setValues([intestazioni]);
  
  // Formattazione intestazioni
  sheet.getRange(1, 1, 1, intestazioni.length)
    .setFontWeight('bold')
    .setBackground('#4285f4')
    .setFontColor('white');
  
  // Larghezza colonne
  sheet.setColumnWidth(1, 150); // Timestamp
  sheet.setColumnWidth(2, 120); // Customer ID
  sheet.setColumnWidth(3, 200); // Nome Account
  sheet.setColumnWidth(4, 100); // Mese
  sheet.setColumnWidth(5, 120); // Costo
  
  console.log('📋 Foglio configurato con intestazioni');
}

/**
 * Calcola il periodo del mese precedente
 */
function calcolaPeriodoDate() {
  if (CONFIG.DATE_RANGE.USE_PREVIOUS_MONTH) {
    // Usa il mese precedente (comportamento originale)
    const oggi = new Date();
    const mesePrecedente = new Date(oggi.getFullYear(), oggi.getMonth() - 1, 1);
    const fineMese = new Date(oggi.getFullYear(), oggi.getMonth(), 0);
    
    return {
      inizio: Utilities.formatDate(mesePrecedente, 'Europe/Rome', 'yyyy-MM-dd'),
      fine: Utilities.formatDate(fineMese, 'Europe/Rome', 'yyyy-MM-dd')
    };
  } else {
    // Usa le date personalizzate dalla configurazione
    return {
      inizio: CONFIG.DATE_RANGE.CUSTOM_START_DATE,
      fine: CONFIG.DATE_RANGE.CUSTOM_END_DATE
    };
  }
}

function calcolaPeriodoMesePrecedente() {
  // Funzione mantenuta per compatibilità
  return calcolaPeriodoDate();
}

/**
 * Estrae i dati per un singolo account
 */
function estraiDatiAccount(customerId, periodo, accessToken) {
  try {
    
    
    // Estrai i costi mensili dalle API Google Ads (il nome lo prendiamo dalla configurazione)
    const costi = estraiCostiAccount(customerId, periodo, accessToken);
    
    // Usa il nome dalla configurazione invece di fare una chiamata API separata
    const accountName = (CONFIG.ACCOUNT_NAMES && CONFIG.ACCOUNT_NAMES[customerId]) || `Account ${customerId}`;
    
    // Se non ci sono costi, restituisci comunque una riga con 0€ per il periodo
    if (!costi || costi.length === 0) {
      return [{
        customerId: customerId,
        accountName: accountName,
        month: periodo.inizio.substring(0, 7), // YYYY-MM
        cost: 0
      }];
    }
    
    // Prepara i dati per il foglio - una riga per ogni mese
    const datiAccount = costi.map(costoMensile => ({
      customerId: customerId,
      accountName: accountName,
      month: costoMensile.mese, // YYYY-MM dal raggruppamento
      cost: costoMensile.costo
    }));
    
    return datiAccount;
    
  } catch (error) {
    console.error(`❌ Errore nell'estrazione dati account ${customerId}:`, error);
    
    // Restituisci una riga di errore invece di null
    const accountName = (CONFIG.ACCOUNT_NAMES && CONFIG.ACCOUNT_NAMES[customerId]) || `Account ${customerId}`;
    return [{
      customerId: customerId,
      accountName: accountName,
      month: periodo.inizio.substring(0, 7), // YYYY-MM
      cost: 0
    }];
  }
}



/**
 * Estrae i costi mensili per un account dalle API Google Ads
 */
function estraiCostiAccount(customerId, periodo, accessToken) {
  try {
    // Query GAQL per ottenere i costi giornalieri
    const query = `
      SELECT 
        segments.date,
        metrics.cost_micros
      FROM campaign
      WHERE segments.date BETWEEN '${periodo.inizio}' AND '${periodo.fine}'
    `;
    
    const response = eseguiQueryGoogleAds(query, customerId, accessToken);
    if (!response || !response.results || response.results.length === 0) {
      return [];
    }
    
    // Raggruppa i costi per mese
    const costiPerMese = {};
    
    for (const result of response.results) {
      const data = result.segments.date;
      const costoMicros = parseInt(result.metrics.costMicros) || 0;
      const costo = costoMicros / 1000000; // Converti da micros a EUR
      
      // Estrai anno-mese dalla data (YYYY-MM-DD -> YYYY-MM)
      const annoMese = data.substring(0, 7);
      
      if (!costiPerMese[annoMese]) {
        costiPerMese[annoMese] = 0;
      }
      costiPerMese[annoMese] += costo;
    }
    
    // Genera tutti i mesi del periodo (anche quelli senza costi)
    const costiMensili = [];
    const meseInizio = periodo.inizio.substring(0, 7); // YYYY-MM
    const meseFine = periodo.fine.substring(0, 7); // YYYY-MM
    
    // Genera tutti i mesi tra inizio e fine
    let meseCorrente = meseInizio;
    while (meseCorrente <= meseFine) {
      const costo = costiPerMese[meseCorrente] || 0; // 0 se il mese non ha costi
      costiMensili.push({
        mese: meseCorrente,
        costo: costo
      });
      
      // Passa al mese successivo
      const [anno, mese] = meseCorrente.split('-');
      const meseNum = parseInt(mese);
      if (meseNum === 12) {
        meseCorrente = `${parseInt(anno) + 1}-01`;
      } else {
        meseCorrente = `${anno}-${String(meseNum + 1).padStart(2, '0')}`;
      }
    }
    
    return costiMensili;
    
  } catch (error) {
    console.error(`❌ Errore nell'estrazione costi account ${customerId}:`, error);
    return [];
  }
}

/**
 * Aggiunge i dati estratti al foglio
 */
function aggiungiDatiAlFoglio(sheet, dati) {
  if (!dati || dati.length === 0) {
    return 0;
  }
  
  const timestamp = new Date();
  const righeDaAggiungere = [];
  
  for (const dato of dati) {
    righeDaAggiungere.push([
      timestamp,                    // Timestamp
      dato.customerId,             // Customer ID
      dato.accountName,            // Nome Account
      dato.month,                  // Mese
      dato.cost                    // Costo
    ]);
  }
  
  // Trova l'ultima riga con dati
  const ultimaRiga = sheet.getLastRow();
  const rigaInizio = ultimaRiga + 1;
  
  // Aggiungi i dati
  sheet.getRange(rigaInizio, 1, righeDaAggiungere.length, righeDaAggiungere[0].length)
    .setValues(righeDaAggiungere);
  
  // Formattazione numeri per la colonna costo
  const colonnaCosto = 5; // Colonna E
  sheet.getRange(rigaInizio, colonnaCosto, righeDaAggiungere.length, 1)
    .setNumberFormat('#,##0.00€');
  
  return righeDaAggiungere.length;
}




/**
 * Funzione per pulire tutti i dati (ATTENZIONE!)
 */
function pulisciTuttiDati() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    '⚠️ ATTENZIONE',
    'Questa operazione eliminerà TUTTI i dati dal foglio. Sei sicuro?',
    ui.ButtonSet.YES_NO
  );
  
  if (response === ui.Button.YES) {
    const sheet = getSheetDestinazione();
    const ultimaRiga = sheet.getLastRow();
    
    if (ultimaRiga > 1) {
      sheet.getRange(2, 1, ultimaRiga - 1, 5).clearContent();
      console.log('🗑️ Tutti i dati sono stati eliminati');
    } else {
      console.log('ℹ️ Nessun dato da eliminare');
    }
  }
}

/**
 * Esegue una query Google Ads API
 */
function eseguiQueryGoogleAds(query, customerId, accessToken) {
  try {

    
    // Verifica che le credenziali API siano configurate
    if (!API_CONFIG.DEVELOPER_TOKEN || !API_CONFIG.CLIENT_ID || !API_CONFIG.CLIENT_SECRET || !API_CONFIG.REFRESH_TOKEN) {
      throw new Error('Credenziali API Google Ads non configurate completamente');
    }
    
    // Usa l'access token passato come parametro
    if (!accessToken) {
      throw new Error('Impossibile ottenere access token');
    }
    
    // Costruisci l'URL dell'API
    const apiUrl = `${API_CONFIG.BASE_URL}/customers/${customerId}/googleAds:search`;
    
    // Prepara i parametri della query
    const requestBody = {
      query: query.trim()
    };
    
    // Esegui la chiamata API con login-customer-id per Manager Account
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'developer-token': API_CONFIG.DEVELOPER_TOKEN,
      'Content-Type': 'application/json'
    };
    
    // Se abbiamo un Manager Account configurato, usalo come login-customer-id
    // Il Manager Account è quello che abbiamo identificato come "1538996322"
    const managerAccountId = '1538996322';
    
    if (managerAccountId) {
      headers['login-customer-id'] = managerAccountId;
    }
    
    const response = UrlFetchApp.fetch(apiUrl, {
      method: 'POST',
      headers: headers,
      payload: JSON.stringify(requestBody)
    });
    
    const responseCode = response.getResponseCode();
    if (responseCode !== 200) {
      const errorText = response.getContentText();
      console.error(`❌ Errore API (${responseCode}):`, errorText);
      console.error(`🔍 URL utilizzato: ${apiUrl}`);
      console.error(`🔍 Query utilizzata: ${query}`);
      console.error(`🔍 Headers:`, {
        'Authorization': `Bearer ${accessToken.substring(0, 20)}...`,
        'developer-token': API_CONFIG.DEVELOPER_TOKEN ? '***' + API_CONFIG.DEVELOPER_TOKEN.slice(-4) : 'Non configurato',
        'Content-Type': 'application/json'
      });
      throw new Error(`Errore API Google Ads: ${responseCode} - ${errorText}`);
    }
    
    const responseData = JSON.parse(response.getContentText());
    return responseData;
    
  } catch (error) {
    console.error(`❌ Errore nell'esecuzione query Google Ads per account ${customerId}:`, error);
    throw error;
  }
}

/**
 * Ottiene un access token fresco usando il refresh token
 */
function ottieniAccessToken() {
  try {

    
    const response = UrlFetchApp.fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      payload: {
        client_id: API_CONFIG.CLIENT_ID,
        client_secret: API_CONFIG.CLIENT_SECRET,
        refresh_token: API_CONFIG.REFRESH_TOKEN,
        grant_type: 'refresh_token'
      }
    });
    
    const responseCode = response.getResponseCode();
    if (responseCode !== 200) {
      const errorText = response.getContentText();
      console.error(`❌ Errore refresh token (${responseCode}):`, errorText);
      return null;
    }
    
    const tokens = JSON.parse(response.getContentText());
    const accessToken = tokens.access_token;
    
    if (!accessToken) {
      console.error('❌ Access token non ricevuto nella risposta');
      return null;
    }
    
    
    return accessToken;
    
  } catch (error) {
    console.error('❌ Errore nell\'ottenimento access token:', error);
    
    // Rileva automaticamente errori OAuth e suggerisci soluzioni
    if (typeof rilevaErroreOAuth === 'function') {
      rilevaErroreOAuth(error);
    }
    
    return null;
  }
}
