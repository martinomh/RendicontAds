  /**
  * Utilities per Google Ads Costi Script
  * Funzioni di supporto essenziali per la gestione e configurazione
  */

  /**
  * Crea un menu personalizzato nel foglio di calcolo
  */
  function creaMenuPersonalizzato() {
    const ui = SpreadsheetApp.getUi();
    
    ui.createMenu('🚀 Google Ads Costi')
      .addItem('📊 Estrai Costi Mensili', 'estraiCostiMensili')
      .addSeparator()
      .addItem('🗑️ Pulisci Dati', 'pulisciTuttiDati')
      .addSeparator()
          .addSubMenu(ui.createMenu('🔑 OAuth2 Setup')
      .addItem('🔄 Rigenera Refresh Token', 'rigeneraRefreshToken')
      .addItem('🔑 Converti Codice in Refresh Token', 'convertiCodiceInRefreshToken')
      .addItem('📋 Genera URL Autorizzazione', 'getRefreshTokenSimple')
      .addItem('🧪 Test Connessione OAuth', 'testConnessioneOAuth')
      .addItem('🔍 Verifica Stato Refresh Token', 'verificaStatoRefreshToken')
      .addItem('🔄 Mantieni Token Attivo', 'mantieniRefreshTokenAttivo'))
    .addSeparator()
      .addItem('☑️ Seleziona Account', 'selezionaAccountInterattivo')
    .addSubMenu(ui.createMenu('📅 Configurazione Date')
      .addItem('📅 Configura Intervallo Date', 'configuraIntervalloDate')
      .addItem('📋 Mostra Date Configurate', 'mostraDateConfigurate'))
      .addToUi();
    
    console.log('✅ Menu personalizzato creato');
  }

  /**
  * Verifica che tutta la configurazione sia corretta
  */
  function verificaConfigurazioneCompleta() {
    console.log('🔍 Verifica configurazione...');
    
    let errori = [];
    
    // Verifica CONFIG (CUSTOMER_IDS viene gestito dinamicamente dal foglio "Configurazione")
    if (!CONFIG.SHEET_NAME) {
      errori.push('❌ SHEET_NAME non configurato');
    }
    
    // Verifica API_CONFIG
    if (!API_CONFIG.DEVELOPER_TOKEN || API_CONFIG.DEVELOPER_TOKEN === 'INSERISCI_IL_TUO_DEVELOPER_TOKEN_QUI') {
      errori.push('❌ DEVELOPER_TOKEN non configurato');
    }
    
    if (!API_CONFIG.CLIENT_ID || API_CONFIG.CLIENT_ID === 'INSERISCI_IL_TUO_CLIENT_ID_QUI') {
      errori.push('❌ CLIENT_ID non configurato');
    }
    
    if (!API_CONFIG.CLIENT_SECRET || API_CONFIG.CLIENT_SECRET === 'INSERISCI_IL_TUO_CLIENT_SECRET_QUI') {
      errori.push('❌ CLIENT_SECRET non configurato');
    }
    
    if (!API_CONFIG.REFRESH_TOKEN || API_CONFIG.REFRESH_TOKEN === 'INSERISCI_IL_TUO_REFRESH_TOKEN_QUI') {
      errori.push('❌ REFRESH_TOKEN non configurato');
    }
    
    // Customer IDs vengono verificati dinamicamente dal foglio "Configurazione"
    
    if (errori.length === 0) {
      console.log('✅ Configurazione completa e corretta!');
      return true;
    } else {
      console.error('❌ Errori di configurazione trovati:');
      errori.forEach(errore => console.error(errore));
      return false;
    }
  }

  /**
  * Funzione chiamata automaticamente all'apertura del foglio
  */
  function onOpen() {
    // Crea il menu personalizzato
    if (typeof creaMenuPersonalizzato === 'function') {
      creaMenuPersonalizzato();
    }
    
    // Mostra avviso se la configurazione non è completa
    if (!verificaConfigurazioneCompleta()) {
      const ui = SpreadsheetApp.getUi();
      ui.alert(
        '⚠️ Configurazione Incompleta',
        'Lo script non è ancora configurato correttamente.\n\n' +
        '📋 Per configurare:\n' +
        '1. Configura le credenziali API nel file config.gs\n' +
        '2. Seleziona gli account dal menu "📊 Gestione Account"\n' +
        '3. Esegui "📊 Estrai Costi Mensili" per i primi dati',
        ui.ButtonSet.OK
      );
    }
  }

  /**
  * Versione semplificata di getRefreshToken che non si blocca
  */
  function getRefreshTokenSimple() {
    try {
      console.log('🔑 OAuth2 Setup - Versione semplificata');
      
      // Verifica credenziali
      if (!API_CONFIG.CLIENT_ID || !API_CONFIG.CLIENT_SECRET) {
        return null;
      }
      
      const clientId = API_CONFIG.CLIENT_ID;
      const clientSecret = API_CONFIG.CLIENT_SECRET;
      
      console.log('📋 URL per ottenere il codice di autorizzazione:');
      console.log('https://accounts.google.com/o/oauth2/auth?client_id=' + clientId + '&redirect_uri=urn:ietf:wg:oauth:2.0:oob&scope=https://www.googleapis.com/auth/adwords&response_type=code&access_type=offline&prompt=consent');
      
      console.log('📝 PROSSIMI PASSI:');
      console.log('1. Copia l\'URL sopra e aprilo nel browser');
      console.log('2. Autorizza l\'applicazione');
      console.log('3. Copia il codice di autorizzazione');
      console.log('4. Esegui getRefreshTokenWithCode(codice)');
      
      return 'URL generato - controlla i log';
      
    } catch (error) {
      console.error('❌ Errore:', error);
      return null;
    }
  }

  /**
  * Funzione per rigenerare il refresh token quando è scaduto
  * Questa funzione gestisce il caso specifico di "invalid_grant" error
  */
  function rigeneraRefreshToken() {
    try {
      console.log('🔄 Rigenerazione refresh token...');
      
      // Verifica che CLIENT_ID e CLIENT_SECRET siano configurati
      if (!API_CONFIG.CLIENT_ID || !API_CONFIG.CLIENT_SECRET) {
        console.error('❌ CLIENT_ID e CLIENT_SECRET devono essere configurati prima');
        return null;
      }
      
      const clientId = API_CONFIG.CLIENT_ID;
      const clientSecret = API_CONFIG.CLIENT_SECRET;
      
      // Genera l'URL di autorizzazione
      const authUrl = `https://accounts.google.com/o/oauth2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=urn:ietf:wg:oauth:2.0:oob&` +
        `scope=https://www.googleapis.com/auth/adwords&` +
        `response_type=code&` +
        `access_type=offline&` +
        `prompt=consent`;
      
      console.log('🔗 URL di autorizzazione generato:');
      console.log(authUrl);
      
      // Mostra le istruzioni all'utente
      const ui = SpreadsheetApp.getUi();
      const response = ui.alert(
        '🔑 Rigenerazione Refresh Token',
        'Il tuo refresh token è scaduto. Segui questi passi:\n\n' +
        '1. Copia questo URL e aprilo nel browser:\n\n' +
        authUrl + '\n\n' +
        '2. Autorizza l\'applicazione\n' +
        '3. Copia il codice di autorizzazione\n' +
        '4. Esegui la funzione "Converti Codice in Refresh Token" dal menu\n\n' +
        'Vuoi che copi l\'URL negli appunti?',
        ui.ButtonSet.YES_NO
      );
      
      if (response === ui.Button.YES) {
        // Prova a copiare negli appunti (funziona solo in alcuni browser)
        try {
          const html = `<script>navigator.clipboard.writeText('${authUrl}').then(() => alert('URL copiato negli appunti!')).catch(() => alert('Impossibile copiare automaticamente. Copia manualmente l\'URL dai log.'));</script>`;
          HtmlService.createHtmlOutput(html).setTitle('Copia URL').setWidth(400).setHeight(200);
        } catch (e) {
          console.log('⚠️ Impossibile copiare automaticamente - copia manualmente l\'URL');
        }
      }
      
      return authUrl;
      
    } catch (error) {
      console.error('❌ Errore durante la rigenerazione del refresh token:', error);
      return null;
    }
  }

  /**
  * Converte un codice di autorizzazione in refresh token
  * Usa questa funzione dopo aver ottenuto il codice da rigeneraRefreshToken()
  */
  function convertiCodiceInRefreshToken() {
    try {
      console.log('🔄 Conversione codice in refresh token...');
      
      // Verifica credenziali
      if (!API_CONFIG.CLIENT_ID || !API_CONFIG.CLIENT_SECRET) {
        return null;
      }
      
      const clientId = API_CONFIG.CLIENT_ID;
      const clientSecret = API_CONFIG.CLIENT_SECRET;
      
      // Richiedi il codice all'utente
      const ui = SpreadsheetApp.getUi();
      const code = ui.prompt(
        '🔑 Codice di Autorizzazione',
        'Incolla qui il codice di autorizzazione ottenuto da Google:',
        ui.ButtonSet.OK_CANCEL
      );
      
      if (code.getSelectedButton() === ui.Button.CANCEL || !code.getResponseText()) {
        console.log('❌ Operazione annullata');
        return null;
      }
      
      const authCode = code.getResponseText().trim();
      console.log('🔄 Codice ricevuto, conversione in corso...');
      
      // Converti il codice in refresh token
      const response = UrlFetchApp.fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        payload: {
          client_id: clientId,
          client_secret: clientSecret,
          code: authCode,
          grant_type: 'authorization_code',
          redirect_uri: 'urn:ietf:wg:oauth:2.0:oob'
        }
      });
      
      const responseCode = response.getResponseCode();
      const responseText = response.getContentText();
      
      if (responseCode !== 200) {
        console.error(`❌ Errore API (${responseCode}):`, responseText);
        throw new Error(`Errore API: ${responseCode} - ${responseText}`);
      }
      
      const tokens = JSON.parse(responseText);
      
      if (tokens.error) {
        throw new Error('Errore API: ' + (tokens.error_description || tokens.error));
      }
      
      if (!tokens.refresh_token) {
        throw new Error('Refresh token non ricevuto. Riprova con prompt=consent');
      }
      
      // Mostra il risultato
      const result = ui.alert(
        '✅ Refresh Token Generato!',
        'Il nuovo refresh token è stato generato con successo!\n\n' +
        '📋 PROSSIMI PASSI:\n' +
        '1. Copia questo refresh token:\n\n' +
        tokens.refresh_token + '\n\n' +
        '2. Incollalo in config.gs nella sezione API_CONFIG.REFRESH_TOKEN\n' +
        '3. Salva il file\n' +
        '4. Verifica la connessione API\n\n' +
        '⚠️ IMPORTANTE: Mantieni questo token sicuro!',
        ui.ButtonSet.OK
      );
      
      console.log('✅ Refresh Token generato:', tokens.refresh_token);
      console.log('📝 Copia questo token in config.gs');
      
      return tokens.refresh_token;
      
    } catch (error) {
      console.error('❌ Errore durante la conversione del codice:', error);
      
      const ui = SpreadsheetApp.getUi();
      ui.alert(
        '❌ Errore Conversione',
        'Si è verificato un errore:\n\n' + error.message + '\n\n' +
        '🔧 SOLUZIONI:\n' +
        '• Verifica che il codice sia corretto e non scaduto\n' +
        '• Assicurati di aver usato prompt=consent nell\'URL OAuth2\n' +
        '• Riprova con un nuovo codice di autorizzazione',
        ui.ButtonSet.OK
      );
      
      return null;
    }
  }

  /**
 * Ottiene la lista di tutti gli account Google Ads accessibili
 */
function ottieniListaAccount() {
  try {

    
    // Verifica credenziali
    if (!testCredenziali()) {
      return null;
    }
    
    // Ottieni access token
    const accessToken = ottieniAccessToken();
    if (!accessToken) {
      console.error('❌ Impossibile ottenere access token');
      return null;
    }
    
    // Per ottenere la lista degli account, usiamo l'endpoint corretto dalla documentazione
    const apiUrl = `${API_CONFIG.BASE_URL}/customers:listAccessibleCustomers`;
    
    console.log('🔗 Chiamata API per ottenere customer accessibili...');


    
    const response = UrlFetchApp.fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'developer-token': API_CONFIG.DEVELOPER_TOKEN,
        'Content-Type': 'application/json'
      }
    });
    
    const responseCode = response.getResponseCode();
    if (responseCode !== 200) {
      const errorText = response.getContentText();
      console.error(`❌ Errore API (${responseCode}):`, errorText);
      throw new Error(`Errore API: ${responseCode} - ${errorText}`);
    }
    
    const responseData = JSON.parse(response.getContentText());
    const accessibleCustomers = responseData.resourceNames || [];
    
    console.log(`✅ Trovati ${accessibleCustomers.length} customer accessibili`);
    
    if (accessibleCustomers.length === 0) {
      console.log('⚠️ Nessun customer accessibile trovato');
      return [];
    }
    
    // Ora otteniamo i dettagli di ogni customer e gestiamo la gerarchia dei Manager Account
    const accountList = [];
    const processedCustomers = new Set(); // Per evitare duplicati
    
    // Funzione ricorsiva per elaborare customer e i loro sub-account
    function processCustomer(customerId, level = 0) {
      if (processedCustomers.has(customerId)) {
        return; // Evita duplicati
      }
      
      processedCustomers.add(customerId);
      const indent = '  '.repeat(level);
      
      try {

        
        // Query per ottenere i dettagli del customer
        const query = `
          SELECT 
            customer.id,
            customer.descriptive_name,
            customer.currency_code,
            customer.time_zone,
            customer.manager
          FROM customer
        `;
        
        const customerApiUrl = `${API_CONFIG.BASE_URL}/customers/${customerId}/googleAds:search`;
        
        const customerResponse = UrlFetchApp.fetch(customerApiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'developer-token': API_CONFIG.DEVELOPER_TOKEN,
            'Content-Type': 'application/json'
          },
          payload: JSON.stringify({
            query: query.trim()
          })
        });
        
        const customerResponseCode = customerResponse.getResponseCode();
        if (customerResponseCode === 200) {
          const customerData = JSON.parse(customerResponse.getContentText());
          const results = customerData.results || [];
          
          if (results.length > 0) {
            const customer = results[0].customer;
            
            const accountInfo = {
              id: customer.id || customerId,
              name: customer.descriptiveName || `Account ${customerId}`,
              currency: customer.currencyCode || 'EUR',
              timezone: customer.timeZone || 'Europe/Rome',
              isManager: customer.manager || false,
              level: level
            };
            
            accountList.push(accountInfo);
            console.log(`${indent}✅ Aggiunto: ${accountInfo.name} (${accountInfo.isManager ? 'Manager' : 'Account'})`);
            
            // Se è un Manager Account, cerca i sub-account
            if (accountInfo.isManager) {
              console.log(`${indent}🔍 Manager Account rilevato, cerco sub-account...`);
              
              // Torniamo alla query customer_client che funzionava per trovare i sub-account
              const subAccountQuery = `
                SELECT 
                  customer_client.id,
                  customer_client.descriptive_name,
                  customer_client.currency_code,
                  customer_client.time_zone,
                  customer_client.manager
                FROM customer_client
              `;
              
              const subAccountResponse = UrlFetchApp.fetch(customerApiUrl, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'developer-token': API_CONFIG.DEVELOPER_TOKEN,
                  'Content-Type': 'application/json'
                },
                payload: JSON.stringify({
                  query: subAccountQuery.trim()
                })
              });
              
              const subAccountResponseCode = subAccountResponse.getResponseCode();
              if (subAccountResponseCode === 200) {
                const subAccountData = JSON.parse(subAccountResponse.getContentText());
                const subResults = subAccountData.results || [];
                
                console.log(`${indent}📋 Trovati ${subResults.length} sub-account`);
                
                for (const subResult of subResults) {
                  // Ora sappiamo che la struttura è customerClient (con C maiuscola)
                  const subCustomer = subResult.customerClient;
                  
                  if (!subCustomer) {
                    console.log(`${indent}⚠️ Nessun customerClient trovato in:`, Object.keys(subResult));
                    continue;
                  }
                  
                  const subAccountInfo = {
                    id: subCustomer.id,
                    name: subCustomer.descriptiveName,
                    currency: subCustomer.currencyCode,
                    timezone: subCustomer.timeZone,
                    isManager: subCustomer.manager || false,
                    level: level + 1,
                    parentManager: customerId
                  };
                  
                  accountList.push(subAccountInfo);
                  console.log(`${indent}  ✅ Sub-account: ${subAccountInfo.name}`);
                  
                  // Se anche questo è un manager, elaboralo ricorsivamente
                  if (subAccountInfo.isManager && subAccountInfo.id !== 'unknown') {
                    processCustomer(subAccountInfo.id, level + 1);
                  }
                }
              } else {
                console.log(`${indent}⚠️ Impossibile ottenere sub-account per manager ${customerId}: ${subAccountResponseCode}`);
                const errorText = subAccountResponse.getContentText();
                console.log(`${indent}🔍 Errore dettagliato:`, errorText);
              }
            }
          }
        } else {
          console.log(`${indent}⚠️ Impossibile ottenere dettagli per customer ${customerId}`);
        }
        
        // Pausa tra le chiamate per evitare rate limiting
        Utilities.sleep(100);
        
      } catch (error) {
        console.log(`${indent}⚠️ Errore nel customer ${customerId}:`, error);
      }
    }
    
    // Elabora tutti i customer accessibili
    for (const customerResource of accessibleCustomers) {
      const customerId = customerResource.replace('customers/', '');
      processCustomer(customerId, 0);
    }
    
    console.log(`✅ Elaborati ${accountList.length} account con dettagli completi`);
    return accountList;
    
  } catch (error) {
    console.error('❌ Errore nell\'ottenimento lista account:', error);
    return null;
  }
  }

  /**
 * Mostra una finestra di dialogo per selezionare gli account
 */
function selezionaAccountInterattivo() {
  try {
    console.log('☑️ Avvio selezione account interattiva...');
    
    // Ottieni la lista degli account
    const accounts = ottieniListaAccount();
    if (!accounts || accounts.length === 0) {
      const ui = SpreadsheetApp.getUi();
      ui.alert(
        '❌ Nessun Account Trovato',
        'Non è stato possibile ottenere la lista degli account.\n\n' +
        '🔧 POSSIBILI CAUSE:\n' +
        '• Credenziali OAuth2 non valide\n' +
        '• Nessun account accessibile\n' +
        '• Problemi di connessione API\n\n' +
        'Verifica prima la configurazione delle credenziali.',
        ui.ButtonSet.OK
      );
      return;
    }
    
    // Crea l'HTML per la selezione
    const htmlContent = createAccountSelectorHTML(accounts);
    
    // Mostra la finestra di dialogo
    const htmlOutput = HtmlService.createHtmlOutput(htmlContent)
      .setTitle('Seleziona Account Google Ads')
      .setWidth(600)
      .setHeight(500);
    
    SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Seleziona Account');
    
  } catch (error) {
    console.error('❌ Errore nella selezione account:', error);
  }
}

/**
 * Crea l'HTML per il selettore di account
 */
function createAccountSelectorHTML(accounts) {
  const currentAccounts = CONFIG.CUSTOMER_IDS || [];
  
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <base target="_top">
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .account-item { 
          display: flex; 
          align-items: center; 
          padding: 10px; 
          border: 1px solid #ddd; 
          margin: 5px 0; 
          border-radius: 5px;
          background: #f9f9f9;
        }
        .account-item:hover { background: #e9e9e9; }
        .account-info { flex: 1; margin-left: 10px; }
        .account-name { font-weight: bold; color: #1a73e8; }
        .account-details { font-size: 12px; color: #666; margin-top: 2px; }
        .buttons { text-align: center; margin-top: 20px; }
        button { 
          padding: 10px 20px; 
          margin: 0 10px; 
          border: none; 
          border-radius: 5px; 
          cursor: pointer;
          font-size: 14px;
        }
        .btn-primary { background: #1a73e8; color: white; }
        .btn-secondary { background: #f1f3f4; color: #5f6368; }
        .btn-primary:hover { background: #1557b0; }
        .btn-secondary:hover { background: #e8eaed; }
        .summary { 
          background: #e8f0fe; 
          padding: 10px; 
          border-radius: 5px; 
          margin-bottom: 20px;
          border-left: 4px solid #1a73e8;
        }
        .main-account { 
          border-left: 4px solid #1a73e8; 
          background: #f8f9fa;
        }
        .sub-account { 
          border-left: 2px solid #34a853; 
          background: #f1f8e9;
          font-size: 14px;
        }
        .sub-account .account-name { 
          color: #137333; 
        }
      </style>
    </head>
    <body>
      <h2>📊 Seleziona Account Google Ads</h2>
      
      <div class="summary">
        <strong>📋 Trovati ${accounts.length} account accessibili</strong><br>
        Seleziona gli account da cui estrarre i costi mensili.
      </div>
      
      <div id="accounts-list">
  `;
  
  // Aggiungi ogni account con gerarchia
  accounts.forEach(account => {
    const isSelected = currentAccounts.includes(account.id);
    const isManager = account.isManager ? ' (Manager Account)' : '';
    const level = account.level || 0;
    const indent = '&nbsp;'.repeat(level * 4); // Indentazione HTML
    const levelClass = level > 0 ? 'sub-account' : 'main-account';
    
    html += `
      <div class="account-item ${levelClass}" style="margin-left: ${level * 20}px;">
        <input type="checkbox" 
               id="account-${account.id}" 
               value="${account.id}"
               ${isSelected ? 'checked' : ''}>
        <div class="account-info">
          <div class="account-name">${indent}${account.name}${isManager}</div>
          <div class="account-details">
            ID: ${account.id} | 
            Valuta: ${account.currency} | 
            Timezone: ${account.timezone}
            ${account.parentManager ? ` | Manager: ${account.parentManager}` : ''}
          </div>
        </div>
      </div>
    `;
  });
  
  html += `
      </div>
      
      <div class="buttons">
        <button class="btn-secondary" onclick="google.script.host.close()">❌ Annulla</button>
        <button class="btn-primary" onclick="saveSelectedAccounts()">💾 Salva Selezione</button>
      </div>
      
      <script>
        function saveSelectedAccounts() {
          const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
          const selectedIds = Array.from(checkboxes).map(cb => cb.value);
          
          console.log('Account selezionati:', selectedIds);
          
          // Chiama la funzione Google Apps Script
          google.script.run
            .withSuccessHandler(function(result) {
              alert('✅ Configurazione salvata!\\n\\nAccount selezionati: ' + selectedIds.length);
              google.script.host.close();
            })
            .withFailureHandler(function(error) {
              alert('❌ Errore nel salvataggio: ' + error.message);
            })
            .salvaAccountSelezionati(selectedIds);
        }
      </script>
    </body>
    </html>
  `;
  
  return html;
}

/**
 * Salva gli account selezionati nella configurazione
 */
function salvaAccountSelezionati(selectedIds) {
  try {
    console.log('💾 Salvataggio account selezionati:', selectedIds);
    
    // Salva la configurazione in una nuova tab "Configurazione"
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let configSheet = spreadsheet.getSheetByName('Configurazione');
    
    if (!configSheet) {
      configSheet = spreadsheet.insertSheet('Configurazione');
      console.log('📋 Creata nuova tab "Configurazione"');
    }
    
    // Pulisci il foglio e crea l'header
    configSheet.clear();
    configSheet.getRange('A1:B1').setValues([['Customer ID', 'Nome Account']]);
    configSheet.getRange('A1:B1').setFontWeight('bold');
    configSheet.getRange('A1:B1').setBackground('#4285f4');
    configSheet.getRange('A1:B1').setFontColor('white');
    
    // Aggiorna anche i nomi degli account se disponibili
    const accounts = ottieniListaAccount();
    const configData = [];
    
    if (accounts) {
      accounts.forEach(account => {
        if (selectedIds.includes(account.id)) {
          configData.push([account.id, account.name]);
        }
      });
    } else {
      // Se non riusciamo a ottenere i nomi, usa solo gli ID
      selectedIds.forEach(id => {
        configData.push([id, 'Nome da recuperare']);
      });
    }
    
    // Scrivi i dati nel foglio
    if (configData.length > 0) {
      configSheet.getRange(2, 1, configData.length, 2).setValues(configData);
    }
    
    // Aggiorna anche la configurazione in memoria per l'esecuzione corrente
    CONFIG.CUSTOMER_IDS = selectedIds;
    CONFIG.ACCOUNT_NAMES = {};
    configData.forEach(row => {
      CONFIG.ACCOUNT_NAMES[row[0]] = row[1];
    });
    
    console.log('✅ Configurazione salvata nella tab "Configurazione":');
    console.log('Customer IDs:', CONFIG.CUSTOMER_IDS);
    console.log('Account Names:', CONFIG.ACCOUNT_NAMES);
    
    // Mostra conferma
    const ui = SpreadsheetApp.getUi();
    ui.alert(
      '✅ Configurazione Salvata',
      `Sono stati selezionati ${selectedIds.length} account:\n\n` +
      selectedIds.map(id => `• ${(CONFIG.ACCOUNT_NAMES && CONFIG.ACCOUNT_NAMES[id]) || id}`).join('\n') +
      '\n\nOra puoi eseguire "Estrai Costi Mensili" per ottenere i dati.',
      ui.ButtonSet.OK
    );
    
    return true;
    
  } catch (error) {
    console.error('❌ Errore nel salvataggio account:', error);
    throw error;
  }
}

/**
 * Funzione per rilevare automaticamente errori OAuth e suggerire soluzioni
 */
function rilevaErroreOAuth(error) {
    try {
      const errorMessage = error.toString().toLowerCase();
      
      if (errorMessage.includes('invalid_grant') || errorMessage.includes('token has been expired')) {
        console.log('🔍 Rilevato errore OAuth: Refresh token scaduto o revocato');
        
        const ui = SpreadsheetApp.getUi();
        const response = ui.alert(
          '🔑 Refresh Token Scaduto',
          'Il tuo refresh token è scaduto o è stato revocato.\n\n' +
          'Per risolvere questo problema:\n' +
          '1. Vai nel menu "🔑 OAuth2 Setup"\n' +
          '2. Clicca su "🔄 Rigenera Refresh Token"\n' +
          '3. Segui le istruzioni per ottenere un nuovo token\n\n' +
          'Vuoi aprire la guida per la rigenerazione del token?',
          ui.ButtonSet.YES_NO
        );
        
        if (response === ui.Button.YES) {
          rigeneraRefreshToken();
        }
        
        return true; // Errore gestito
      }
      
      if (errorMessage.includes('unauthorized') || errorMessage.includes('401')) {
        console.log('🔍 Rilevato errore OAuth: Credenziali non valide');
        console.log('💡 Suggerimento: Verifica CLIENT_ID e CLIENT_SECRET in config.gs');
        return true;
      }
      
      return false; // Errore non gestito
      
    } catch (e) {
      console.error('❌ Errore nel rilevamento OAuth:', e);
      return false;
    }
  }

  /**
   * Configura l'intervallo di date per l'estrazione
   */
  function configuraIntervalloDate() {
    try {
      const ui = SpreadsheetApp.getUi();
      
      // Mostra le opzioni
      const response = ui.alert(
        '📅 Configurazione Intervallo Date',
        'Come vuoi configurare l\'intervallo di date?\n\n' +
        '1. Mese precedente (automatico)\n' +
        '2. Date personalizzate\n\n' +
        'Attualmente: ' + (CONFIG.DATE_RANGE.USE_PREVIOUS_MONTH ? 'Mese precedente' : 'Date personalizzate'),
        ui.ButtonSet.YES_NO_CANCEL
      );
      
      if (response === ui.Button.YES) {
        // Mese precedente
        CONFIG.DATE_RANGE.USE_PREVIOUS_MONTH = true;
        ui.alert('✅ Configurazione aggiornata', 'Ora userà il mese precedente automaticamente', ui.ButtonSet.OK);
      } else if (response === ui.Button.NO) {
        // Date personalizzate
        const startDate = ui.prompt(
          '📅 Data Inizio',
          'Inserisci la data di inizio (formato: YYYY-MM-DD):\nEsempio: 2025-08-01',
          ui.ButtonSet.OK_CANCEL
        );
        
        if (startDate.getSelectedButton() === ui.Button.OK) {
          const endDate = ui.prompt(
            '📅 Data Fine',
            'Inserisci la data di fine (formato: YYYY-MM-DD):\nEsempio: 2025-08-31',
            ui.ButtonSet.OK_CANCEL
          );
          
          if (endDate.getSelectedButton() === ui.Button.OK) {
            // Valida le date
            const startDateStr = startDate.getResponseText().trim();
            const endDateStr = endDate.getResponseText().trim();
            
            if (validaFormatoData(startDateStr) && validaFormatoData(endDateStr)) {
              CONFIG.DATE_RANGE.USE_PREVIOUS_MONTH = false;
              CONFIG.DATE_RANGE.CUSTOM_START_DATE = startDateStr;
              CONFIG.DATE_RANGE.CUSTOM_END_DATE = endDateStr;
              
              ui.alert(
                '✅ Configurazione aggiornata',
                `Date personalizzate configurate:\nInizio: ${startDateStr}\nFine: ${endDateStr}`,
                ui.ButtonSet.OK
              );
            } else {
              ui.alert('❌ Errore', 'Formato date non valido. Usa il formato YYYY-MM-DD', ui.ButtonSet.OK);
            }
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Errore nella configurazione date:', error);
      SpreadsheetApp.getUi().alert('❌ Errore', 'Errore durante la configurazione delle date', SpreadsheetApp.getUi().ButtonSet.OK);
    }
  }

  /**
   * Mostra le date attualmente configurate
   */
  function mostraDateConfigurate() {
    try {
      const periodo = calcolaPeriodoDate();
      const ui = SpreadsheetApp.getUi();
      
      let messaggio = '📅 Configurazione Date Attuale:\n\n';
      messaggio += `Modalità: ${CONFIG.DATE_RANGE.USE_PREVIOUS_MONTH ? 'Mese precedente (automatico)' : 'Date personalizzate'}\n`;
      messaggio += `Periodo: ${periodo.inizio} - ${periodo.fine}\n\n`;
      
      if (!CONFIG.DATE_RANGE.USE_PREVIOUS_MONTH) {
        messaggio += `Data inizio personalizzata: ${CONFIG.DATE_RANGE.CUSTOM_START_DATE}\n`;
        messaggio += `Data fine personalizzata: ${CONFIG.DATE_RANGE.CUSTOM_END_DATE}\n`;
      }
      
      ui.alert('📅 Date Configurate', messaggio, ui.ButtonSet.OK);
      
    } catch (error) {
      console.error('❌ Errore nel mostrare le date configurate:', error);
    }
  }

  /**
   * Valida il formato della data (YYYY-MM-DD)
   */
  function validaFormatoData(dataStr) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dataStr)) {
      return false;
    }
    
    const data = new Date(dataStr);
    return data instanceof Date && !isNaN(data);
  }

  /**
   * Testa la connessione OAuth2 e il refresh token
   * Utile per verificare che tutto funzioni prima di schedulare lo script
   */
  function testConnessioneOAuth() {
    try {
      console.log('🧪 Test connessione OAuth2...');
      
      // Verifica credenziali
      if (!API_CONFIG.CLIENT_ID || !API_CONFIG.CLIENT_SECRET || !API_CONFIG.REFRESH_TOKEN) {
        console.error('❌ Credenziali OAuth2 non configurate');
        return false;
      }
      
      // Testa il refresh token
      const accessToken = ottieniAccessToken();
      if (!accessToken) {
        console.error('❌ Impossibile ottenere access token');
        console.error('💡 POSSIBILI CAUSE:');
        console.error('   • Refresh token scaduto (non utilizzato per 6 mesi)');
        console.error('   • Utente ha revocato l\'accesso');
        console.error('   • Credenziali CLIENT_ID/CLIENT_SECRET non valide');
        console.error('   • Limite di 100 refresh token raggiunto');
        return false;
      }
      
      console.log('✅ Connessione OAuth2 funzionante');
      console.log('✅ Access token ottenuto con successo');
      console.log('✅ Refresh token valido');
      
      // Testa una chiamata API semplice
      console.log('🔗 Test chiamata API Google Ads...');
      const testQuery = 'SELECT customer.id FROM customer LIMIT 1';
      const testResponse = eseguiQueryGoogleAds(testQuery, '1538996322', accessToken);
      
      if (testResponse && testResponse.results) {
        console.log('✅ Chiamata API Google Ads funzionante');
        console.log('✅ Tutto configurato correttamente per l\'esecuzione automatica');
        console.log('💡 CONSIGLIO: Esegui questo test prima di schedulare lo script');
        return true;
      } else {
        console.error('❌ Chiamata API Google Ads fallita');
        return false;
      }
      
    } catch (error) {
      console.error('❌ Errore nel test connessione:', error);
      return false;
    }
  }

  /**
   * Verifica lo stato del refresh token senza fare chiamate API
   * Utile per controlli rapidi
   */
  function verificaStatoRefreshToken() {
    try {
      console.log('🔍 Verifica stato refresh token...');
      
      // Verifica credenziali
      if (!API_CONFIG.CLIENT_ID || !API_CONFIG.CLIENT_SECRET || !API_CONFIG.REFRESH_TOKEN) {
        console.error('❌ Credenziali OAuth2 non configurate');
        return false;
      }
      
      // Testa solo il refresh token
      const accessToken = ottieniAccessToken();
      if (!accessToken) {
        console.error('❌ Refresh token non valido');
        return false;
      }
      
      console.log('✅ Refresh token funzionante');
      console.log('💡 Il token è valido e può essere utilizzato per l\'esecuzione automatica');
      return true;
      
    } catch (error) {
      console.error('❌ Errore nella verifica refresh token:', error);
      return false;
    }
  }

  /**
   * Mantiene attivo il refresh token eseguendo una vera chiamata API
   * Da eseguire giornalmente tramite trigger per evitare scadenze
   * 
   * IMPORTANTE: Google considera un refresh token "utilizzato" solo quando
   * viene usato per fare chiamate API reali, non solo per ottenere access token
   */
  function mantieniRefreshTokenAttivo() {
    try {
      console.log('🔄 Keep-alive refresh token (con chiamata API reale)...');
      
      // Verifica credenziali
      if (!API_CONFIG.CLIENT_ID || !API_CONFIG.CLIENT_SECRET || !API_CONFIG.REFRESH_TOKEN) {
        console.error('❌ Credenziali OAuth2 non configurate per keep-alive');
        return false;
      }
      
      // Ottieni access token
      const accessToken = ottieniAccessToken();
      if (!accessToken) {
        console.error('❌ Impossibile ottenere access token durante keep-alive');
        return false;
      }
      
      // FAI UNA VERA CHIAMATA API per "utilizzare" il refresh token
      // Usa listAccessibleCustomers che è veloce e non richiede parametri
      const apiUrl = `${API_CONFIG.BASE_URL}/customers:listAccessibleCustomers`;
      
      const response = UrlFetchApp.fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'developer-token': API_CONFIG.DEVELOPER_TOKEN,
          'Content-Type': 'application/json'
        }
      });
      
      const responseCode = response.getResponseCode();
      if (responseCode === 200) {
        console.log('✅ Keep-alive completato - Refresh token utilizzato attivamente');
        return true;
      } else {
        console.error(`❌ Keep-alive fallito (${responseCode}):`, response.getContentText());
        return false;
      }
      
    } catch (error) {
      console.error('❌ Errore durante keep-alive:', error);
      return false;
    }
  }