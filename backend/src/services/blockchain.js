const algosdk = require('algosdk');
const { healthRecordManagerId, accessControlId } = require('../blockchain/config');

// Initialize Algorand client
const algodClient = new algosdk.Algodv2(
  process.env.ALGOD_TOKEN, 
  process.env.ALGOD_SERVER, 
  process.env.ALGOD_PORT
);

const getAlgoBalance = async (address) => {
  try {
    const accountInfo = await algodClient.accountInformation(address).do();
    console.log('Algo balance for', address, ':', accountInfo.amount);
    return accountInfo.amount;
  } catch (error) {
    console.error('Error fetching Algo balance:', error);
    throw error;
  }
};

const optInToHLLA = async (address) => {
  try {
    console.log('Opting in to HLLA for address:', address);
    const suggestedParams = await algodClient.getTransactionParams().do();
    const txn = algosdk.makeAssetTransferTxnWithSuggestedParams(
      address,
      address,
      undefined,
      undefined,
      0,
      undefined,
      parseInt(process.env.HLLA_ASSET_ID),
      suggestedParams
    );

    const privateKey = algosdk.mnemonicToSecretKey(process.env.HEALTH_RECORD_MANAGER_MNEMONIC).sk;
    const signedTxn = txn.signTxn(privateKey);
    const { txId } = await algodClient.sendRawTransaction(signedTxn).do();
    await algosdk.waitForConfirmation(algodClient, txId, 4);
    console.log('Opted in to HLLA asset');
  } catch (error) {
    console.error('Error opting in to HLLA:', error);
    throw error;
  }
};

const addHealthRecord = async (patientAddress, recordHash) => {
  try {
    console.log('Patient Address:', patientAddress);
    console.log('Health Record Manager Mnemonic:', process.env.HEALTH_RECORD_MANAGER_MNEMONIC);
    console.log('Health Record Manager ID:', healthRecordManagerId);
    
    const algoBalance = await getAlgoBalance(patientAddress);
    console.log('Algo Balance:', algoBalance);
    
    const suggestedParams = await algodClient.getTransactionParams().do();
    console.log('Suggested Params:', suggestedParams);
    
    // Encode application arguments
    const appArgs = [
      new Uint8Array(Buffer.from("add_record")),
      new Uint8Array(Buffer.from(recordHash, 'hex'))
    ];
    console.log('Application Arguments:', appArgs);
    
    const txn = algosdk.makeApplicationNoOpTxn(
      patientAddress,
      suggestedParams,
      healthRecordManagerId,
      appArgs
    );
    
    // Use the account that the smart contract expects
    const signingAccount = algosdk.mnemonicToSecretKey(process.env.HEALTH_RECORD_MANAGER_MNEMONIC);
    console.log('Signing Account Address:', signingAccount.addr);
    
    if (patientAddress !== signingAccount.addr) {
      throw new Error(`Patient address mismatch. Expected: ${signingAccount.addr}, Got: ${patientAddress}`);
    }
    
    const signedTxn = txn.signTxn(signingAccount.sk);
    console.log('Transaction signed');
    
    const { txId } = await algodClient.sendRawTransaction(signedTxn).do();
    console.log('Transaction sent with ID:', txId);
    
    const result = await algosdk.waitForConfirmation(algodClient, txId, 4);
    console.log('Transaction result:', JSON.stringify(result, null, 2));
    
    return txId;
  } catch (error) {
    console.error('Error adding health record:', error);
    if (error.response && error.response.text) {
      console.error('Error details:', error.response.text);
    }
    throw error;
  }
};

const grantAccess = async (patientAddress, doctorAddress) => {
  try {
    console.log('Patient Address:', patientAddress);
    console.log('Doctor Address:', doctorAddress);
    console.log('Access Control Mnemonic:', process.env.ACCESS_CONTROL_MNEMONIC);
    
    const suggestedParams = await algodClient.getTransactionParams().do();
    
    const appArgs = [
      new Uint8Array(Buffer.from("grant_access")),
      new Uint8Array(Buffer.from(doctorAddress))
    ];

    const txn = algosdk.makeApplicationNoOpTxn(
      patientAddress,
      suggestedParams,
      accessControlId,
      appArgs
    );
    
    const signingAccount = algosdk.mnemonicToSecretKey(process.env.ACCESS_CONTROL_MNEMONIC);

    if (patientAddress !== signingAccount.addr) {
      throw new Error('Patient address mismatch');
    }

    const signedTxn = txn.signTxn(signingAccount.sk);
    const { txId } = await algodClient.sendRawTransaction(signedTxn).do();
    await algosdk.waitForConfirmation(algodClient, txId, 4);
    return txId;
  } catch (error) {
    console.error('Error granting access:', error);
    throw error;
  }
};

const checkAccess = async (patientAddress, doctorAddress) => {
  try {
    console.log('Patient Address:', patientAddress);
    console.log('Doctor Address:', doctorAddress);
    console.log('Access Control Mnemonic:', process.env.ACCESS_CONTROL_MNEMONIC);
    
    const suggestedParams = await algodClient.getTransactionParams().do();
    
    const appArgs = [
      new Uint8Array(Buffer.from("check_access")),
      new Uint8Array(Buffer.from(patientAddress))
    ];

    const txn = algosdk.makeApplicationNoOpTxn(
      doctorAddress,
      suggestedParams,
      accessControlId,
      appArgs
    );
    
    const signingAccount = algosdk.mnemonicToSecretKey(process.env.ACCESS_CONTROL_MNEMONIC);

    if (doctorAddress !== signingAccount.addr) {
      throw new Error('Doctor address mismatch');
    }

    const signedTxn = txn.signTxn(signingAccount.sk);
    const { txId } = await algodClient.sendRawTransaction(signedTxn).do();
    const result = await algosdk.waitForConfirmation(algodClient, txId, 4);
    return result['global-state-delta'] && result['global-state-delta'][0]['value']['uint'] === 1;
  } catch (error) {
    console.error('Error checking access:', error);
    throw error;
  }
};

const verifyTransaction = async (txId) => {
  try {
    const status = await algodClient.status().do();
    const lastRound = status['last-round'];
    const txInfo = await algodClient.pendingTransactionInformation(txId).do();
    if (txInfo['confirmed-round'] && txInfo['confirmed-round'] <= lastRound) {
      return true;
    }
  } catch (error) {
    console.error('Error verifying transaction:', error);
  }
  return false;
};

const getBlockchainStatus = async () => {
  try {
    const status = await algodClient.status().do();
    console.log('Blockchain Status:', status);
    return { lastRound: status['last-round'] };
  } catch (error) {
    console.error('Error fetching blockchain status:', error);
    throw error;
  }
};

const distributeInitialTokens = async (address, amount) => {
  try {
    console.log('Distributing tokens to:', address);
    console.log('Amount:', amount);
    console.log('Admin Address:', process.env.ADMIN_ADDRESS);
    console.log('Admin Mnemonic:', process.env.ADMIN_MNEMONIC);
    console.log('HLLA Asset ID:', process.env.HLLA_ASSET_ID);
    
    const suggestedParams = await algodClient.getTransactionParams().do();
    const txn = algosdk.makeAssetTransferTxnWithSuggestedParams(
      process.env.ADMIN_ADDRESS,
      address,
      undefined,
      undefined,
      amount,
      undefined,
      parseInt(process.env.HLLA_ASSET_ID),
      suggestedParams
    );

    const adminAccount = algosdk.mnemonicToSecretKey(process.env.ADMIN_MNEMONIC);
    const signedTxn = txn.signTxn(adminAccount.sk);
    const { txId } = await algodClient.sendRawTransaction(signedTxn).do();
    await algosdk.waitForConfirmation(algodClient, txId, 4);
    
    return txId;
  } catch (error) {
    console.error('Error distributing initial tokens:', error);
    throw error;
  }
};

const getHLLABalance = async (address) => {
  try {
    console.log('Fetching HLLA balance for:', address);
    const accountInfo = await algodClient.accountInformation(address).do();
    console.log('Account Info:', JSON.stringify(accountInfo, null, 2));
    const assets = accountInfo['assets'];
    console.log('Assets:', assets);
    let hllaAsset = assets.find(asset => asset['asset-id'] === parseInt(process.env.HLLA_ASSET_ID));
    if (!hllaAsset) {
      console.log('Account not opted in to HLLA, opting in now...');
      await optInToHLLA(address);
      // Fetch account info again after opting in
      const updatedAccountInfo = await algodClient.accountInformation(address).do();
      hllaAsset = updatedAccountInfo['assets'].find(asset => asset['asset-id'] === parseInt(process.env.HLLA_ASSET_ID));
    }
    console.log('HLLA Asset:', hllaAsset);
    return hllaAsset ? hllaAsset.amount : 0;
  } catch (error) {
    console.error('Error fetching HLLA balance:', error);
    throw error;
  }
};

module.exports = {
  algodClient,
  addHealthRecord,
  grantAccess,
  checkAccess,
  verifyTransaction,
  getBlockchainStatus,
  distributeInitialTokens,
  getHLLABalance,
  getAlgoBalance
};