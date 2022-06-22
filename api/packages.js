"use strict";

/*
 * Purpose : To load all Node.Js Packages
 * Package : NPM Packages
 * Developed By  : Sorav Garg (soravgarg123@gmail.com)
*/

const async = require("async"), 
      puppeteer = require('puppeteer'),
      cheerio = require('cheerio'), 
      fs = require('fs'), 
      axios = require('axios'), 
      nodemailer = require('nodemailer'), 
      jsonToCsv = require('json-2-csv');

/* Require Enviornment File  */
require('dotenv').config();

module.exports = {
  async,
  puppeteer,
  cheerio,
  fs,
  axios,
  nodemailer,
  jsonToCsv
}