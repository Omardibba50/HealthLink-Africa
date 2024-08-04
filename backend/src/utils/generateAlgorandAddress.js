const algosdk = require('algosdk');

const generateAlgorandAddress = () => {
  const account = algosdk.generateAccount();
  return account.addr;
};

module.exports = generateAlgorandAddress;
