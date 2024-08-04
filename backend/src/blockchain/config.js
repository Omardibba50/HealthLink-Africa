// backend/src/blockchain/config.js

const algosdk = require('algosdk');
const fs = require('fs');
const path = require('path');

const appIds = JSON.parse(fs.readFileSync(path.join(__dirname, 'app_ids.json')));

const algodClient = new algosdk.Algodv2(
  process.env.ALGOD_TOKEN || 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  process.env.ALGOD_SERVER || 'http://localhost:4001',
  process.env.ALGOD_PORT || ''
);

module.exports = {
  algodClient,
  healthRecordManagerId: appIds.health_record_manager,
  accessControlId: appIds.access_control,
};