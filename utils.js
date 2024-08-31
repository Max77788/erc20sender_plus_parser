const mysql = require('mysql2');
require("dotenv").config();


const DATABASE_NAME = process.env.db_name || 'usdt_polygon'

// Create a MySQL connection (without specifying the database)
let db = mysql.createConnection({
    host: process.env.db_host || 'localhost',
    user: process.env.db_user || 'root',
    password: process.env.db_password,
    database: DATABASE_NAME,
    port: process.env.db_port || 3306  // Default MySQL port is 3306
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

  // Record the start time
  const startTime = Date.now();

      for (const to of to_list) {

        try {
          const _gasPrice = await provider.getGasPrice();
          const gasPrice = Math.floor(_gasPrice * _gasgain);
        // Формируем объект для оценки gasLimit.
        const gasLimitEstimate = await _contract.estimateGas.sendTokens(
          count, to 
        );

      // console.log(`TxGasPrice: ${gasPrice.toString()} wei, NetGasPrice: ${_gasPrice.toString()} wei, gasLimitEstimate: ${gasLimitEstimate.toString()}`);
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

      // console.log('\x1b[32m%s\x1b[32m\x1b[0m', 'Transaction send: ' + tx.hash);
      const receipt = await tx.wait();
      // console.log('\x1b[32m%s\x1b[32m\x1b[0m', 'Transaction confirmed: ' + receipt.transactionHash);

      const sql_update = `UPDATE recipients SET sent_tokens = 1 WHERE address = ?`;
      const params = [to];

      console.log('\x1b[32m%s\x1b[0m', `Successfully sent ${count} tokens to ${to}`)

      // Update the database and wait for it to complete
      await new Promise((resolve, reject) => {
        const sql_update = `UPDATE recipients SET sent_tokens = 1 WHERE address = ?`;
        const params = [to];

        db.query(sql_update, params, (err, result) => {
            if (err) {
                console.error('Error updating row:', err);
                reject(err); // Reject the promise in case of error
            } else {
                console.log('Address sent_tokens marked successfully');
                resolve(result); // Resolve the promise if successful
            }
        });
    });

    } catch (error) {
    console.error(`Failed to send transaction to ${to}:`,);

    // Handle specific errors like "replacement transaction underpriced"
    if (error.code === 'REPLACEMENT_UNDERPRICED') {
        // Optionally retry with a higher gas price or log for manual intervention
        console.log(`Retrying with higher gas price for ${to}`);
        
        const _gasPrice = await provider.getGasPrice();
        const gasPrice = Math.floor(_gasPrice * _gasgain);
        const gasLimitEstimate = await _contract.estimateGas.sendTokens(
          count, to 
        );
        const gasLimit = gasLimitEstimate.add(gasLimitEstimate.div(10));

        const higherGasPrice = Math.floor(gasPrice * 1.1); // Increase by 10%
        try {
            const txRetry = await _contract.sendTokens(count, to, {
                gasLimit: gasLimit,
                gasPrice: higherGasPrice,
            });
            console.log(`Transaction retried successfully: ${txRetry.hash}`);
        } catch (retryError) {
            console.error(`Retry failed for ${to}:`);
        }
  }
}
}
// Record the end time
const endTime = Date.now();

// Calculate the execution time
const executionTime = endTime - startTime; // in milliseconds

console.log(`Execution time of send batch: ${executionTime} ms`);
};  

module.exports = {
sendBatch
}