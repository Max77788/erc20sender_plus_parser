const mysql = require('mysql2');
require("dotenv").config();


const DATABASE_NAME = 'usdt_polygon'

// Create a MySQL connection (without specifying the database)
let db = mysql.createConnection({
    host: process.env.db_host || 'localhost',
    user: process.env.db_user || 'root',
    password: process.env.db_password,
    database: DATABASE_NAME
});

// Connect to the MySQL server
db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
});


const _sendBatch = async (_from, _batch_to, _tokenId, _count, _contract, provider, _gasgain) => {
  const from    = _from;  
  const to      = _batch_to;
  const tokenId = _tokenId;
  const count   = _count;
  try {
    const _gasPrice = await provider.getGasPrice();
    const gasPrice = _gasPrice * _gasgain;
    const tx       = await _contract.airDrop(     
    from, to, tokenId, count,
    { 
     // value: purchaseAmount,
     // gasLimit: _gaslimit,
      gasPrice: gasPrice,
    //  gasPrice: ethers.utils.parseUnits(_gasprice, "gwei"),
    }
  );
  console.log('\x1b[32m%s\x1b[32m\x1b[0m','Buy order send: '+ tx.hash)
  const receiptet = await tx.wait();
  console.log('\x1b[32m%s\x1b[32m\x1b[0m','Buy order confirmed: '+ receiptet.transactionHash);
  } catch (e) {
    console.log(e);
 }
};

const sendBatch = async (_from, _batch_to, _tokenId, _count, _contract, provider, _gasgain) => {
  const from    = _from;  
  const to_list      = _batch_to;
  const tokenId = _tokenId;
  const count   = _count;
  try {
      const _gasPrice = await provider.getGasPrice();
      const gasPrice = Math.floor(_gasPrice * _gasgain);

      for (const to of to_list) {
        // Формируем объект для оценки gasLimit.
        const gasLimitEstimate = await _contract.estimateGas.sendTokens(
          count, to 
        );

      console.log(`TxGasPrice: ${gasPrice.toString()} wei, NetGasPrice: ${_gasPrice.toString()} wei, gasLimitEstimate: ${gasLimitEstimate.toString()}`);
      // Добавляем некоторый "задел" в размере 10% к оценке gasLimit.
      const gasLimit = gasLimitEstimate.add(gasLimitEstimate.div(10));
      // console.log(from, to, tokenId, count,);             
      const tx = await _contract.sendTokens(     
        count, to,
          { 
              gasLimit: gasLimit,
              gasPrice: gasPrice,
          }
      );

      console.log('\x1b[32m%s\x1b[32m\x1b[0m', 'Transaction send: ' + tx.hash);
      const receipt = await tx.wait();
      console.log('\x1b[32m%s\x1b[32m\x1b[0m', 'Transaction confirmed: ' + receipt.transactionHash);

      const sql_update = `UPDATE recipients SET sent_tokens = 1 WHERE address = ?`;
      const params = [to];

      db.query(sql_update, params, (err, result) => {
          if (err) {
              console.error('Error updating row:', err);
          } else {
              console.log('Row updated successfully:', result.message);
          }
      });

    }
  } catch (e) {
      console.log(e);
  }
};  

module.exports = {
sendBatch
}