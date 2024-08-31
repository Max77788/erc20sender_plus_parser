const ethers = require("ethers");
const clear  = require('clear');
const ps     = require("prompt-sync");
const prompt = ps({ sigint: true });
const mysql = require('mysql2');
const fs     = require('fs');
const {sendBatch} = require('./utils.js')
require("dotenv").config();
const { utils } = require('ethers');
const tokenAbi = require('./abiReal.json')


/*
const tokenAbi = [
    "function Rewards(address _from, address[] memory _to, uint256 amount) public virtual returns (bool)"
  ];
*/
    

// Создаем аккаунт
const wallet = new ethers.Wallet(process.env.privatekey);

// Подключение к провайдеру Ethereum (Binance Smart Chain)
const provider          = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const account           = wallet.connect(provider);
const contract_address  = process.env.contract_address;
const abi               = new ethers.utils.Interface(tokenAbi);
const contract          = new ethers.Contract(contract_address, abi, account);

// Получаем настройки рассылки
const _chunkSize = process.env.chunkSize
const _from      = process.env.from
const _tokenId   = process.env.tokenId
const _count     = process.env.count
const _gasgain   = process.env.gasgain
const _delay     = process.env.delay



const DATABASE_NAME = process.env.db_name || 'usdt_polygon'


// Create a MySQL connection (without specifying the database)
let db = mysql.createConnection({
    host: process.env.db_host || 'localhost',
    user: process.env.db_user || 'root',
    password: process.env.db_password,
    database: DATABASE_NAME,
    // port: process.env.db_port || 3306,  // Default MySQL port is 3306
});


// const db = mysql.createConnection(process.env.sql_connection_uri)

// Connect to the MySQL server
db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to the database as id', db.threadId);
});

const delay = (duration) => {
    return new Promise(resolve => setTimeout(resolve, duration));
}

const chunkArray = (array, chunkSize) => {
    var result = [];
    for (var i = 0; i < array.length; i += chunkSize) {
        result.push(array.slice(i, i + chunkSize));       
    }    
    return result;
}

function getAddresses() {
    return new Promise((resolve, reject) => {
        const SQL_OBTAIN_NOT_SENT = 'SELECT address FROM recipients WHERE sent_tokens = 0';
        db.query(SQL_OBTAIN_NOT_SENT, (err, results) => {
            if (err) {
                reject(err);
            } else if (results.length === 0) {
                console.warn('Warning: No addresses were found');
                resolve([]);
            } else {

                const addresses = results.map(result => result.address);
                resolve(addresses);
            }
        });
    });
}


const sender = async (_chunkSize, _from, _tokenId, _count, _contract, _provider, _gasgain, _delay) => {    

    /* local pull
    // Чтение токенов из файла где они столбиком
    const filePath = 'input/recipientsTest.txt';
    const tokensData = fs.readFileSync(filePath, 'utf8');
    // Разбиваем построчно
    let tokens = tokensData.split('\r\n')
    // проходим по массиву данных чтобы получить массив адрессов в нижнем регистре для однозначного определения адресов
    tokens = tokens.map(p=>p.toLowerCase())
    // Чистим дубли В массиве токенов
    let uniqueArray = [...new Set(tokens)];
    

    // Разбиваем массив получателей на пакеты
    const batchs = chunkArray(uniqueArray, Number(_chunkSize))
    */

    // pull from db
    const addresses = await getAddresses();  // Wait until addresses are fetched
    const batchs = chunkArray(addresses, Number(_chunkSize));  // Now process the addresses

    console.log(`Batches length is ${batchs[0].length}`)

    for (const batch of batchs) {
     if (process.env.sendtype == '1') {
        await sendBatch(_from, batch, _tokenId, _count, _contract, _provider, _gasgain)
        console.log("From sendBatch: Everything is freakishly awesome!") 
    } else {
        sendBatch(_from, batch, _tokenId, _count, _contract, _provider, _gasgain)
        console.log(`Ждем ${_delay} секунд`)
        await delay(_delay * 1000) 
     }    
    }
}

const startmenu = async () => {
    clear();
    const starting = () => {
    console.log('\x1b[36m%s\x1b[0m',`\nБот:`)};  
    starting();
    console.log(`
    Главное меню. 
    1) Запуск рассылки
    2) Цена газа
  `);
    
    let menu = prompt("");
    
    if (menu == '1'){
        clear();
        starting();      
        sender(_chunkSize, _from, _tokenId, _count, contract, provider, _gasgain, _delay)  
    } else if (menu == '2') { clear();
        starting();
        const gasPrice = await provider.getGasPrice();
        console.log(`Текущая рыночная цена газа: ${Number(gasPrice/10**9).toString()} gwei`); 
    } else {
        clear();
        starting();
        console.log('Not a valid option, exiting');
        process.exit(1)
    }};
    
    // startmenu();
    

    // Define your parameters just once
    const params = [_chunkSize, _from, _tokenId, _count, contract, provider, _gasgain, _delay];

    // Function to ensure sender is called sequentially
    const startSending = async () => {
        while (true) {
            await sender(...params);
            console.log('Waiting 5 seconds before the next execution...');
            await delay(5000);  // Wait for 5 seconds before the next execution
        }
    };

    // Start the loop
    startSending();