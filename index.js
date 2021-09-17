const express = require('express');
const axios = require('axios');
const nunjucks = require('nunjucks');

//const Database = require("@replit/database");

//const db = new Database();

const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const moons = require('./moons.js');
const mongo = require('./database.js');

let db = mongo.getDb();
let collection;
//collection.find({}).forEach(console.dir)
db.then((db) => {
  collection = db.collection("collection");
});

nunjucks.configure('templates', { autoescape: true });

async function insert(addr, value) {
  await collection.insertOne({ "address": addr, "value": value });
}

async function replace(addr, newvalue) {
  await collection.replaceOne({ "address": addr }, { "address": addr, "value": newvalue });
}

async function find(addr) {
  return await collection.findOne({ "address": addr });
}

const app = express();

app.use(express.static('files'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cookieParser());

let ip_cache = {};
function clearCache() {
  ip_cache = {};
}
setInterval(clearCache, 145000000);

//If I am on break this is true. Reduces faucet payouts to 0.02
const on_break = false;
//If this is true, logs info
const logging = false;
//If this is true, no unopened accounts can claim
const no_unopened = false;

const faucet_addr = "0xAb7211621fc1c0594AC5825Cc27aed5034ffBDEb";

app.get('/', async function(req, res) {
  let errors = false;
  let address = false;
  let given = false;
  let amount = 0;
  //render template 
  return res.send(nunjucks.render('index.html', { errors: errors, address: address, given: given, amount: amount, faucet_address:faucet_addr }));
})

app.post('/', async function(req, res) {
  let errors = false;
  let address = req.body['addr'];
  let given = false;
  let amount = String((Math.floor(Math.random() * 8) / 100) + 0.01);
  let token = req.body['h-captcha-response'];
  let params = new URLSearchParams();
  params.append('response', token);
  params.append('secret', process.env.secret);
  let captcha_resp = await axios.post('https://hcaptcha.com/siteverify', params)
  captcha_resp = captcha_resp.data;
  let ip = req.header('x-forwarded-for').slice(0, 14);
  if (ip_cache[ip]) {
    ip_cache[ip] = ip_cache[ip] + 1
    if (ip_cache[ip] > 3) {
      errors = "Too many claims from this IP"
      return res.send(nunjucks.render("index.html", { errors: errors, address: address, given: given, amount: amount, on_break: on_break, faucet_address:faucet_addr }));
    }
  } else {
    ip_cache[ip] = 1
  }

  if (logging) {
    console.log(address)
    console.log(req.header('x-forwarded-for'))
  }

  let dry = await moons.faucet_dry(faucet_addr);

  if (captcha_resp['success'] && !dry) {
    //check cookie
    if (req.cookies['last_claim']) {
      if (Number(req.cookies['last_claim']) + 86400000 < Date.now()) {
        //let db_result = await db.get(address);
        let db_result = await find(address);
        if (db_result) {
          db_result = db_result['value'];
          if (Number(db_result) + 86400000 < Date.now()) {
            //all clear, send bananos!
            send = await moons.send_moons(address, amount);
            if (send == false) {
              errors = "Invalid address"
            } else {
              res.cookie('last_claim', String(Date.now()));
              //await db.set(address,String(Date.now()));
              await replace(address, String(Date.now()));
              given = true;
            }
          } else {
            errors = "Last claim too soon"
          }
        } else {
          //all clear, send bananos!
          send = await moons.send_moons(address, amount);
          if (send == false) {
            errors = "Invalid address"
          } else {
            res.cookie('last_claim', String(Date.now()));
            //await db.set(address,String(Date.now()));
            await insert(address, String(Date.now()));
            given = true;
          }
        }
      } else {
        //add errors
        errors = "Last claim too soon"
      }
    } else {
      //check db 
      //let db_result = await db.get(address);
      let db_result = await find(address);
      if (db_result) {
        db_result = db_result['value'];
        if (Number(db_result) + 86400000 < Date.now()) {
          //all clear, send bananos!
          send = await moons.send_moons(address, amount);
          if (send == false) {
            errors = "Invalid address"
          } else {
            res.cookie('last_claim', String(Date.now()));
            //await db.set(address,String(Date.now()));
            await replace(address, String(Date.now()));
            given = true;
          }
        } else {
          errors = "Last claim too soon"
        }
      } else {
        //all clear, send bananos!
        send = await moons.send_moons(address, amount);
        if (send == false) {
          errors = "Invalid address"
        } else {
          res.cookie('last_claim', String(Date.now()));
          //await db.set(address,String(Date.now()));
          await insert(address, String(Date.now()));
          given = true;
        }
      }
    }
  } else {
    errors = "captcha incorrect or faucet dry"
  }
  return res.send(nunjucks.render("index.html", { errors: errors, address: address, given: given, amount: amount, on_break: on_break, faucet_address:faucet_addr }));
})

app.listen(8081, () => {
  console.log(`App on`);
})