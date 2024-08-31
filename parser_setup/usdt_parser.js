const { Web3 } = require('web3');
const mysql = require('mysql2');
require('dotenv').config()


const ADDRESSES_TO_AVOID = [
    "0xe7804c37c13166fF0b37F5aE0BB07A3aEbb6e245",
    "0xf89d7b9c864f589bbF53a82105107622B35EaA40",
    "0x06959153B974D0D5fDfd87D561db6d8d4FA0bb0B",
    "0x576b81F0c21EDBc920ad63FeEEB2b0736b018A58",
    "0x77134cbC06cB00b66F4c7e623D5fdBF6777635EC",
    "0xe84F75FC9cAA49876d0Ba18d309da4231d44E94D",
    "0x51E3D44172868Acc60D68ca99591Ce4230bc75E0",
    "0x0D0707963952f2fBA59dD06f2b425ace40b492Fe",
    "0x71dDc5EA37ede029b384c274aBfA7B7a05A9F40d",
    "0x019D0706D65c4768ec8081eD7CE41F59Eef9b86c",
    "0x1240C57c23bc7DEaf34fE51362f3dFE11eCc6702",
    "0x91Dca37856240E5e1906222ec79278b16420Dc92",
    "0x758BE77a3eE14e7193730560daA07dd3fcBFD200",
    "0x51836A753E344257B361519E948ffCAF5fb8d521",
    "0x290275e3db66394C52272398959845170E4DCb88",
    "0xaf1D3eD13a11126D638E15512419ABB1fA1F8294",
    "0x916ED5586bB328E0eC1a428af060DC3D10919d84",
    "0x0b5e6100243f793e480DE6088dE6bA70aA9f3872",
    "0xfa0b641678F5115ad8a8De5752016bD1359681b9",
    "0x0639556F03714A74a5fEEaF5736a4A64fF70D206",
    "0x0b0F7ebF967146566799229394171FC47f1a765a",
    "0xfd225C9e6601C9d38d8F98d8731BF59eFcF8C0E3",
    "0x0106aDDa066753eaB85bad9F22706648dAEb8075",
    "0xAb3cD5E47B75F6abD57E95E6540ecbF001487d31",
    "0xBA92CFB9eB187822d232b292E3Fd8078c6Ab2f26",
    "0xf89D64b8C1E064C32C7aA825a3d777b2c301b750",
    "0x477b8D5eF7C2C42DB84deB555419cd817c336b6F",
    "0x515281812Fdf5b0D7bE5Fb25b823a2aB79E0A621",
    "0x9f0a0C38E7BbBEECA769733C6193A8bD51Ba6B12",
    "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    "0xD5C08681719445A5Fdce2Bda98b341A49050d821",
    "0x25864a712C80d33Ba1ad7c23CffA18b46F2fc00c",
    "0x274E5361Ee2c3C881DA3Ffe1E3b759bfeCb632BC",
    "0xCa7404EED62a6976Afc335fe08044B04dBB7e97D",
    "0xDe0aBc5ACEE39D6aA639D71Ab988dA9457C262b5",
    "0x082489A616aB4D46d1947eE3F912e080815b08DA",
    "0xe93685f3bBA03016F02bD1828BaDD6195988D950",
    "0x4724F4B3936B4c2d52f8F452719870c5d4c86b4D",
    "0xCACe8D78269ba00f1C4D5Fc3B1228C7DF0a7C8BA",
    "0x21C3de23d98Caddc406E3d31b25e807aDDF33633",
    "0xb090cDcC7B0dEa3400487348bF7E2499f70E9231",
    "0x0E80Abb31aCE45ae26F9A2943Acaab72E77DE9bE",
    "0xe58c8d45477d894bB9A1501Bb0d0A32Af8419Eda",
    "0x00d13778C76831f260adeC9A3f4C100663555555",
    "0x6c54723805154aa221Ff8e3A342311505560878d",
    "0x9cA75D0d97f0b86dEa852Eb0a626F7839673d9D9",
    "0x1622F344F3114C200C5cCBbD26925A6DFcB66B03",
    "0x4C5fdEe62C192630fF67F39F42F56C55fd670069",
    "0x50BE13b54f3EeBBe415d20250598D81280e56772",
    "0x4c28f48448720e9000907BC2611F73022fdcE1fA",
    "0xe9ee9f2857b559C67dD03576A1c74589a6AF6197",
    "0x760DcE7eA6e8BA224BFFBEB8a7ff4Dd1Ef122BfF",
    "0xDFaa75323fB721e5f29D43859390f62Cc4B600b8",
    "0xe98670C2cBAfB2205BC99eBE33093233F7f07CC1",
    "0x3186219579134AAC27852f9F921b6489aE4C158c",
    "0xa1271A8A80748abd3F0DaFD4914aD2F481264447",
    "0x7AB6c736baf1DAc266aAb43884d82974a9ADCcCF",
    "0x9A7ffD7F6c42ab805e0eDF16c25101964C6326B6",
    "0xA595Ea2DAAD5965D7907A039bE0d954d948a76b8",
    "0xFb6FE7802bA9290ef8b00CA16Af4Bc26eb663a28",
    "0x25Da419CE9633b0681be01acA175cD0C0f2C2b47",
    "0x2ac4dDCc005e635495139d627132393934b8026A",
    "0x2Db1D8CdF1Abe8C70b531a790CDf2FF38aecF652",
    "0xFb716817377fe433E60E244500887DD904967738",
    "0x3aD736904E9e65189c3000c7DD2c8AC8bB7cD4e3",
    "0xaa364c1A348f9517009207A1601E0a73C1Cd530b",
    "0xcDd37Ada79F589c15bD4f8fD2083dc88E34A2af2",
    "0x6D17B3F12059eB2ee0b1dccC79DaD77BCBa870dc",
    "0x981BC02Bb8D8962925b4b21792Cf986de2327A50",
    "0xe0572033FA3Ca31A802f89a1E1cA30D0f950c2b2",
    "0x1651D700cD4020334bD185BA4c6E0271ffc0C732",
    "0x406C22b8740ae955b04fD11c2061E053807E2A69",
    "0x84E5Bc3dF0df0f543648f250443c6f4077218312",
    "0x1195Cf65f83B3A5768F3C496D3A05AD6412c64B7",
    "0xa3Fa99A148fA48D14Ed51d610c367C61876997F1",
    "0x19aB546E77d0cD3245B2AAD46bd80dc4707d6307",
    "0xBA4EEE20F434bC3908A0B18DA496348657133A7E",
    "0x70e967acFcC17c3941E87562161406d41676FD83",
    "0x71d4249079684479F2651745fA2fcD79c9b45f53",
    "0x0E530958bFA4Aa9B309949d692827f28340b979A",
    "0x25aB3Efd52e6470681CE037cD546Dc60726948D3",
    "0x3A0d24d59Af3a3444dc6Ef12cdb0c6e38C985288",
    "0xC070A61D043189D99bbf4baA58226bf0991c7b11",
    "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
    "0x505e71695E9bc45943c58adEC1650577BcA68fD9",
    "0x52A258ED593C793251a89bfd36caE158EE9fC4F8",
    "0x2cA5281d1968635E60DBD44d653A0CAa4Ff84b82",
    "0xb8D6681F7EAeadc7FB1b0fa189e0063cE7ec7373"
  ]

// Set up Web3 and connect to the Polygon network (using Infura)
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.RPC_URL));

// USDT contract address on Polygon
const USDT_CONTRACT_ADDRESS = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F';


// const DATABASE_NAME = 'usdt_polygon'

const DATABASE_NAME = process.env.db_name || 'usdt_polygon'

// console.log(`${process.env.db_host}, ${process.env.db_user}, ${process.env.db_password}, ${DATABASE_NAME}, ${process.env.db_port}`)

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

console.log("Connected!")

/*
db.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL server.');

    // Check if the database exists; if not, create it
    db.query(`CREATE DATABASE IF NOT EXISTS ${DATABASE_NAME}`, (err, result) => {
        if (err) throw err;
        console.log(`Database '${DATABASE_NAME}' checked/created.`);

        // Now connect to the newly created/existing database
        const dbWithDatabase = mysql.createConnection({
            host: process.env.db_host || 'localhost',
            user: process.env.db_user || 'root',
            password: process.env.db_password,
            database: DATABASE_NAME
        });

        dbWithDatabase.connect(err => {
            if (err) throw err;
            console.log(`Connected to MySQL database: ${DATABASE_NAME}.`);
        });
    });

});
*/

// Get current timestamp and calculate the timestamp for 20 seconds ago
const currentTime = Math.floor(Date.now() / 1000);
const tenMinutesAgo = currentTime - 600;

// Function to fetch and filter transactions
async function fetchAndFilterTransactions(db) {
    try {
        // Get the latest block number
        const latestBlockNumber = await web3.eth.getBlockNumber();
        // Record the start time
        const startTime = Date.now();

        // Iterate over the last blocks within the last 20 seconds
        for (let i = latestBlockNumber; i >= 0; i--) {
            const block = await web3.eth.getBlock(i, true);
            if (!block || block.timestamp < tenMinutesAgo) break;

            // console.log(`Block transactions length: ${block.transactions.length}`);

            // Iterate over each transaction in the block
            for (let tx of block.transactions) {
                if (tx.to && tx.to.toLowerCase() === USDT_CONTRACT_ADDRESS.toLowerCase()) {
                    // Ensure the input data is long enough to be decoded
                    if (tx.input && tx.input.length >= 138) { // 10 characters for the method ID + 64 for each parameter (32 bytes each)
                        try {
                            const inputData = web3.eth.abi.decodeParameters(['address', 'uint256'], tx.input.slice(10));
                            const recipient = inputData[0];
                            const amount = web3.utils.fromWei(inputData[1], 'mwei');

                            console.log('\x1b[36m%s\x1b[0m', `${recipient} and ${amount}`);

                            // Check if the amount is greater than or equal to 100 USDT and address is allowed
                            if (parseFloat(amount) >= 100 && !ADDRESSES_TO_AVOID.includes(recipient)) {
                                
                                // Check if the recipient address is a contract
                                const code = await web3.eth.getCode(recipient);
                                if (code !== '0x') {
                                    // console.log(`Address ${recipient} is a contract, skipping...`);
                                    continue;
                                }

                                await new Promise((resolve, reject) => {
                                    const sql = 'INSERT IGNORE INTO recipients (address) VALUES (?)';
                                    db.query(sql, [recipient], (err, result) => {
                                        if (err) {
                                            reject(err);
                                        } else {
                                            console.log(`Inserted address: ${recipient}`);
                                            resolve(result);
                                        }
                                    });
                                });
                            }
                        } catch (error) {
                            console.error('Error decoding transaction input data:', error);
                        }
                    } else {
                        console.warn('Transaction input data is too short to decode:', tx.input);
                    }

                    // Add a synchronous delay of 300 milliseconds
                    const startTime = Date.now();
                    while (Date.now() - startTime < 300) {
                        // Do nothing (busy wait)
                    }
                }
            }
        }
        // Record the end time
        const endTime = Date.now();

        // Calculate the execution time
        const executionTime = endTime - startTime; // in milliseconds
        console.log(`Execution time of on parser for loop: ${executionTime} ms`);
    } catch (error) {
        console.error('Error fetching or filtering transactions:', error);
    } finally {
        db.end();
    }
}

// Function to run fetchAndFilterTransactions
async function executeFetchAndFilterTransactions() {
    try {
        // Establish a new database connection each time
        db = mysql.createConnection({
            host: process.env.db_host || 'localhost',
            user: process.env.db_user || 'root',
            password: process.env.db_password,
            database: DATABASE_NAME
        });

        db.connect(err => {
            if (err) {
                console.error('Error connecting to MySQL:', err);
                return;
            }
        });

        await fetchAndFilterTransactions(db);

    } catch (error) {
        console.error('Error in continuous execution:', error);
    }
}

// Set up a function to run fetchAndFilterTransactions every 10 minutes
function runContinuously() {
    // Immediate execution
    executeFetchAndFilterTransactions();

    // Set the interval for continuous execution
    setInterval(() => {
        executeFetchAndFilterTransactions();
    }, 600000);  // 600,000 milliseconds = 10 minutes
}

// Start the continuous execution
runContinuously();