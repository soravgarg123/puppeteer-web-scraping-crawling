"use strict";

/*
 * Purpose : For Jobs Calculator API's
 * Package : Controller
 * Developed By  : Sorav Garg (soravgarg123@gmail.com)
*/

const {
      async,
      puppeteer,
      cheerio,
      axios,
      nodemailer,
      check,
      fs,
      jsonToCsv,
      validationResult
    } = require("../packages.js");

var BuiltInResponse = [];
var PageNo = 1;

var mail = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'it.scrapping@vservesolution.com',
    pass: 'D%SAa5mq*'
  }
});

var mailOptions = {
   from: 'it.scrapping@vservesolution.com',
   to: 'soravgarg123@gmail.com, nandhini@vservesolution.com, jenitadevi99@gmail.com, itsupport@vservesolution.com, anshul.b@vservesolution.com, siva@vservesolution.com',
   subject: '',
   html: '' ,
   attachments: []
}

let jobsController = {nodesk,himalayas,flex,builtin}

  /**
      For delay time
  **/
  function delay(time) {
     return new Promise(function(resolve) { 
        setTimeout(resolve, time)
     });
  }

  /**
      To Get Current Date
  **/
  function getCurrentDate(){
    var today = new Date();
    var dd = (today.getDate() >= 10) ? today.getDate() : "0"+today.getDate();
    var mm = (today.getMonth()+1 >= 10) ? today.getMonth()+1 : "0"+(today.getMonth()+1);
    var yyyy = today.getFullYear();
    var date = yyyy+'-'+mm+'-'+dd;
    return date;
   }

  /**
      For Nodesk Jobs Data
  **/
  async function nodesk(req, res) {
    
      /* Initialize Browser */
      try {

        /* Launch Browser */
        var browser = await puppeteer.launch({
                      headless: (process.env.IS_HEADLESS == 0) ? false : true,
                      args: ["--no-sandbox"],
                      defaultViewport: null
                    });
        var page = await browser.newPage();
        await page.goto(`https://nodesk.co/remote-jobs`, { waitUntil: 'networkidle0', timeout: 0 });

        await page.click('a[href="#browse"]',{delay:500});
        await page.waitForSelector("ol.ais-Hits-list > li", {timeout: 30000});

        /* Load Cheerio HTML */
        var $ = cheerio.load(await page.content());
        let totalJobs = $('li.ais-Hits-item').length;

        let Response = [];
        for (var i = 1; i <= totalJobs; i++) {
            let IsTodayOrFeaturedJob = ($('li.ais-Hits-item:nth-child('+i+') > div > div:nth-child(3) > span').text().replace(/\n/g, "").trim()).toLowerCase();
            if(IsTodayOrFeaturedJob === 'featured' || IsTodayOrFeaturedJob === 'today'){
                let row = {};
                row.JobUrl = `https://nodesk.co${$('li.ais-Hits-item:nth-child('+i+') > div > div:nth-child(2) > h2 > a').attr('href')}`;
                row.Title = $('li.ais-Hits-item:nth-child('+i+') > div > div:nth-child(2) > h2 > a').text().replace(/\n/g, "").replace(/ +(?= )/g,'').trim() || "";
                row.CompanyName = $('li.ais-Hits-item:nth-child('+i+') > div > div:nth-child(2) > h3').text().replace(/\n/g, "").replace(/ +(?= )/g,'').trim() || "";
                row.Location = $('li.ais-Hits-item:nth-child('+i+') > div > div:nth-child(2) > div.inline-flex.items-center.flex-wrap.flex-nowrap-l.mb1-l > h4').text().replace(/\n/g, "").replace(/ +(?= )/g,'').replace(":", "").trim() || "";
                row.Remote = $('li.ais-Hits-item:nth-child('+i+') > div > div:nth-child(2) > div.inline-flex.items-center.flex-wrap.flex-nowrap-l.mb1-l > h5').text().replace(/\n/g, "").replace(/ +(?= )/g,'').trim() || "";
                row.Industry = $('li.ais-Hits-item:nth-child('+i+') > div > div:nth-child(2) > div.flex-l.flex-nowrap-l > div:nth-child(1) > h4 > a').text().replace(/\n/g, "").replace(/ +(?= )/g,'').trim() || "";
                row.JobType = $('li.ais-Hits-item:nth-child('+i+') > div > div:nth-child(2) > div.flex-l.flex-nowrap-l > div:nth-child(2) > h4 > a').text().replace(/\n/g, "").replace(/ +(?= )/g,'').trim() || "";
                row.Salary = $('li.ais-Hits-item:nth-child('+i+') > div > div:nth-child(2) > div.flex-l.flex-nowrap-l > div:nth-child(3) > h4').text().replace(/\n/g, "").replace(/ +(?= )/g,'').trim() || "";
                row.Website = 'https://nodesk.co';
                row.DateTime = IsTodayOrFeaturedJob;
                Response.push(row);
            }
        }

        if(Response.length === 0){
            return res.status(500).json({ResponseCode: 500, Message: "Today jobs not found !!"});
        }

        /* JSON 2 CSV */
        let CurrentDate = await getCurrentDate();
        jsonToCsv.json2csv(Response, (err, csv) => {
            if (err) {
                throw err;
            }

            /* Send Email */
            mailOptions.subject = 'No Desk';
            mailOptions.html = 'Nodesk Today Jobs';
            mailOptions.attachments = [{filename: `nodesk-jobs-${CurrentDate}.csv`, content : csv}];
            mail.sendMail(mailOptions, function(error, info){
                  if (error) {
                    console.log(error);
                  } else {
                    console.log('Email sent: ' + info.response);
                  }
            });
        })

        await browser.close();
        return res.status(200).json({ResponseCode: 200, TotalRecords : Response.length , Data:'nodesk-jobs.csv', Message: "Success."});
      } catch (e) {
        console.log('err',e)
        browser.close();
        return res.status(500).json({ResponseCode: 500, Data:[], Message: "Some error occured Or data not found, please try again."});
      }
  }

  /**
      For Himalayas Jobs Data
  **/
  async function himalayas(req, res) {
    
      /* Initialize Browser */
      try {

        /* Launch Browser */
        var browser = await puppeteer.launch({
                      headless: (process.env.IS_HEADLESS == 0) ? false : true,
                      args: ["--no-sandbox"],
                      defaultViewport: null
                    });
        var page = await browser.newPage();
        await page.goto(`https://himalayas.app/jobs`, { waitUntil: 'networkidle0', timeout: 0 });
        await page.waitForSelector("ul#card-group > div", {timeout: 30000});

        /* Load Cheerio HTML */
        var $ = cheerio.load(await page.content());
        let totalJobs = $('div[name="card"]').length;

        let Response = [];
        for (var i = 1; i <= totalJobs; i++) {
            let IsTodayJob = ($('div[name="card"]:nth-child('+i+') > div:nth-child(2) > div:nth-child(1) > div:nth-child(2) > div > p').text().replace(/\n/g, "").trim()).toLowerCase();
            if(IsTodayJob.includes('minutes') || IsTodayJob.includes('minute') || IsTodayJob.includes('hour') || IsTodayJob.includes('hours')){
                let row = {};
                row.JobUrl = `https://himalayas.app${$('div[name="card"]:nth-child('+i+')').attr('data-path')}`;
                row.Title = $('div[name="card"]:nth-child('+i+') > div:nth-child(2) > div:nth-child(1) > div > a').text().replace(/\n/g, "").replace(/ +(?= )/g,'').trim() || "";
                row.CompanyName = $('div[name="card"]:nth-child('+i+') > div:nth-child(2) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > a:nth-child(1)').text().replace(/\n/g, "").replace(/ +(?= )/g,'').trim() || "";
                row.Location = $('div[name="card"]:nth-child('+i+') > div:nth-child(2) > div:nth-child(3) > div:nth-child(1) > div:nth-child(1) > div > span').text().replace(/\n/g, "").replace(/ +(?= )/g,'').trim() || "";
                row.Remote = "";
                row.Industry = $('div[name="card"]:nth-child('+i+') > div:nth-child(2) > div:nth-child(3) > a > div > div > span').text().replace(/\n/g, "").replace(/ +(?= )/g,'').trim() || "";
                row.JobType = $('div[name="card"]:nth-child('+i+') > div:nth-child(2) > div:nth-child(3) > div:nth-child(2)').text().replace(/\n/g, "").replace(/ +(?= )/g,'').trim() || "";
                row.Salary = "";
                row.Website = 'https://himalayas.app';
                row.DateTime = IsTodayJob;
                Response.push(row);
            }
        }

        if(Response.length === 0){
            return res.status(500).json({ResponseCode: 500, Message: "Today jobs not found !!"});
        }

        /* JSON 2 CSV */
        let CurrentDate = await getCurrentDate();
        jsonToCsv.json2csv(Response, (err, csv) => {
            if (err) {
                throw err;
            }

            /* Send Email */
            mailOptions.subject = 'Himalayas';
            mailOptions.html = 'Himalayas Today Jobs';
            mailOptions.attachments = [{filename: `himalayas-jobs-${CurrentDate}.csv`, content : csv}];
            mail.sendMail(mailOptions, function(error, info){
                  if (error) {
                    console.log(error);
                  } else {
                    console.log('Email sent: ' + info.response);
                  }
            });
        })

        await browser.close();
        return res.status(200).json({ResponseCode: 200, TotalRecords : Response.length , Data:'himalayas-jobs.csv', Message: "Success."});
      } catch (e) {
        console.log('err',e)
        browser.close();
        return res.status(500).json({ResponseCode: 500, Data:[], Message: "Some error occured Or data not found, please try again."});
      }
  }

  /**
      For Flex Jobs Data
  **/
  async function flex(req, res) {
    
      /* Initialize Browser */
      try {

        /* Launch Browser */
        var browser = await puppeteer.launch({
                      headless: (process.env.IS_HEADLESS == 0) ? false : true,
                      args: ["--no-sandbox", "--start-maximized"],
                      defaultViewport: null
                    });
        var page = await browser.newPage();
        await page.goto(`https://www.flexjobs.com/jobs`, { waitUntil: 'networkidle0', timeout: 0 });
        await page.waitForSelector("div#jobcateg-wrap", {timeout: 30000});

        /* Load Cheerio HTML */
        var $$ = cheerio.load(await page.content());

        /* All Jobs Sections */
        var FlexJobsResponse = [];
        let totalJobsSection = $$('div#jobcateg-wrap > div').length;
        console.log('totalJobsSection', totalJobsSection)
        for (var i = 1; i <= 1; i++) {
            let totalCategories = $$('div#jobcateg-wrap > div:nth-child('+i+') > ul > li').length;
            console.log('totalCategories', totalCategories)

            /* All Categories */
            for (var j = 1; j <= 1; j++) {
                if($$('div#jobcateg-wrap > div:nth-child('+i+') > ul > li:nth-child('+j+') > a').length > 0){
                    var CategoryUrl = $$('div#jobcateg-wrap > div:nth-child('+i+') > ul > li:nth-child('+j+') > a').attr('href');
                }else{
                    var CategoryUrl = $$('div#jobcateg-wrap > div:nth-child('+i+') > ul > li:nth-child('+j+') > div:nth-child(1) > div:nth-child(1) > a').attr('href');
                }
                if(!CategoryUrl){
                    continue;
                }

                console.log('CategoryUrl', CategoryUrl);

                /* Visit Category Page */
                await page.goto(`https://www.flexjobs.com${CategoryUrl}`, { waitUntil: 'networkidle0', timeout: 0 });
                await page.waitForSelector("ul#job-list", {timeout: 30000});

                /* Load Cheerio HTML */
                var $ = cheerio.load(await page.content());
                let totalJobs = $('ul#job-list > li').length;

                for (var k = 1; k <= totalJobs; k++) {

                    var IsFeatureJob = $('ul#job-list > li:nth-child('+k+')').hasClass('featured-job');
                    var row = {};
                    row.Category = CategoryUrl;
                    if(IsFeatureJob){
                        var IsTodayJob = ($('ul#job-list > li:nth-child('+k+') > div:nth-child(1) > div:nth-child(2) > div:nth-child(2) > div.job-age').text().replace(/\n/g, "").trim()).toLowerCase();
                        if(IsTodayJob && !IsTodayJob.includes('today')){
                            continue;
                        }

                        row.JobUrl = `https://www.flexjobs.com${$('ul#job-list > li:nth-child('+k+') > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > a.job-link').attr('href')}`;
                        row.Title = $('ul#job-list > li:nth-child('+k+') > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > a.job-title').text().replace(/\n/g, "").replace(/ +(?= )/g,'').trim() || "";
                        row.CompanyName = "";
                        row.Location = $('ul#job-list > li:nth-child('+k+') > div:nth-child(1) > div:nth-child(3) > div:nth-child(1) > span:nth-child(1)').text().replace(/\n/g, "").replace(/ +(?= )/g,'').trim() || "";
                        row.Remote = $('ul#job-list > li:nth-child('+k+') > div:nth-child(1) > div:nth-child(3) > div:nth-child(2)').text().replace(/\n/g, "").replace(/ +(?= )/g,'').trim() || "";
                        row.Industry = "";
                        row.JobType = $('ul#job-list > li:nth-child('+k+') > div:nth-child(1) > div:nth-child(3) > div:nth-child(1) > span:nth-child(2)').text().replace(/\n/g, "").replace(/ +(?= )/g,'').trim() || "";
                        row.Salary = "";
                        row.Website = 'https://www.flexjobs.com';
                        row.DateTime = 'Featured';
                    }else{
                        var IsTodayJob = ($('ul#job-list > li:nth-child('+k+') > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div.job-age').text().replace(/\n/g, "").trim()).toLowerCase();
                        if(!IsTodayJob.includes('today')){
                            continue;
                        }
                        row.JobUrl = `https://www.flexjobs.com${$('ul#job-list > li:nth-child('+k+') > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > a.job-link').attr('href')}`;
                        row.Title = $('ul#job-list > li:nth-child('+k+') > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > a.job-title').text().replace(/\n/g, "").replace(/ +(?= )/g,'').trim() || "";
                        row.CompanyName = "";
                        row.Location = $('ul#job-list > li:nth-child('+k+') > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > span:nth-child(1)').text().replace(/\n/g, "").replace(/ +(?= )/g,'').trim() || "";
                        row.Remote = $('ul#job-list > li:nth-child('+k+') > div:nth-child(1) > div:nth-child(2) > div:nth-child(2)').text().replace(/\n/g, "").replace(/ +(?= )/g,'').trim() || "";
                        row.Industry = "";
                        row.JobType = $('ul#job-list > li:nth-child('+k+') > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > span:nth-child(2)').text().replace(/\n/g, "").replace(/ +(?= )/g,'').trim() || "";
                        row.Salary = "";
                        row.Website = 'https://www.flexjobs.com';
                        row.DateTime = 'Today';
                    }

                    /* Get Job ID */
                    var JobID = $('ul#job-list > li:nth-child('+k+')').attr('data-job');
                    console.log('JobID',JobID)
                    console.log('JobUrl',`https://www.flexjobs.com/insetjob?id=${JobID}`)

                    /* Get Job Details */
                    var JobDetails = await axios({method : 'GET', url : `https://www.flexjobs.com/insetjob?id=${JobID}`});
                        JobDetails = cheerio.load(JobDetails.data);

                    var TrCount = JobDetails('#inset-details > table > tbody > tr').length;
                    for (var tr = 1; tr <= TrCount; tr++) {
                        var IsCategories = (JobDetails('#inset-details > table > tbody > tr:nth-child('+tr+') > th').text().replace(/\n/g, "").trim()).toLowerCase();
                        console.log('IsCategories', IsCategories)
                        if(IsCategories.includes('categories')){
                            row.Industry = JobDetails('#inset-details > table > tbody > tr:nth-child('+tr+') > td').text().replace(/\n/g, "").replace(/ +(?= )/g,'').trim() || "";
                            break;
                        }
                    }
                    FlexJobsResponse.push(row);
                }
            }
        }

        jsonToCsv.json2csv(FlexJobsResponse, (err, csv) => {
            if (err) {
                throw err;
            }

            // write CSV to a file
            fs.writeFileSync('flex-jobs.csv', csv);
        })

        await browser.close();
        return res.status(200).json({ResponseCode: 200, TotalRecords : FlexJobsResponse.length , Data:FlexJobsResponse, Message: "Success."});
      } catch (e) {
        console.log('err',e)
        browser.close();
        return res.status(500).json({ResponseCode: 500, Data:[], Message: "Some error occured Or data not found, please try again."});
      }
  }

  /**
      For Builtin Jobs Data
  **/
  async function builtin(req, res) {
    
      /* Initialize Browser */
      try {

        /* Launch Browser */
        var browser = await puppeteer.launch({
                      headless: (process.env.IS_HEADLESS == 0) ? false : true,
                      args: ["--no-sandbox", "--start-maximized"],
                      defaultViewport: null
                    });
        var page = await browser.newPage();
        await page.goto(`https://builtin.com/jobs?page=1`, { waitUntil: 'networkidle0', timeout: 0 });
        await page.waitForSelector("div.show_incentive > div", {timeout: 30000});

        await delay(3000);
        await autoScroll(page);

        /* Load Cheerio HTML */
        var $ = cheerio.load(await page.content());
        BuiltInResponse = [];
        PageNo = PageNo + 1;
        var IsNextPage = true;
        let totalJobs = $('div.show_incentive > div.job-item').length;
        for (var i = 1; i <= totalJobs; i++) {
            let IsTodayJob = ($('div.show_incentive > div.job-item:nth-child('+i+') > div:nth-child(1) > div.row.no-gutters > div.full-job-row > div.row.basic-info.no-gutters > div.icon-label.info-label.age > span').text().replace(/\n/g, "").trim()).toLowerCase();
            if(IsTodayJob.includes('minutes') || IsTodayJob.includes('minute') || IsTodayJob.includes('hour') || IsTodayJob.includes('hours')){
                let row = {};
                row.JobUrl = $('div.show_incentive > div.job-item:nth-child('+i+') > div:nth-child(1) > div.row.no-gutters > a.job-details-link').attr('href');
                row.Title  = $('div.show_incentive > div.job-item:nth-child('+i+') > div:nth-child(1) > div.row.no-gutters > div.full-job-row > h2.job-title').text().replace(/\n/g, "").replace(/ +(?= )/g,'').trim() || "";
                row.CompanyName  = $('div.show_incentive > div.job-item:nth-child('+i+') > div:nth-child(1) > div.row.no-gutters > div.full-job-row > div.row.basic-info.no-gutters > div.company-title > span').text().replace(/\n/g, "").replace(/ +(?= )/g,'').trim() || "";
                row.Location  = $('div.show_incentive > div.job-item:nth-child('+i+') > div:nth-child(1) > div.row.no-gutters > div.full-job-row > div.row.basic-info.no-gutters > div:nth-child(2) > span').text().replace(/\n/g, "").replace(/ +(?= )/g,'').trim() || "";
                row.Industry  = "";
                row.Website = 'https://builtin.com';
                row.DateTime = IsTodayJob;
                BuiltInResponse.push(row);
            }else if(IsTodayJob.includes('day') || IsTodayJob.includes('days')){
                IsNextPage = false;
                break;
            }
        }

        /* Check Other Pages */
        if(IsNextPage){
            await scrapePaginationData(page);
        }

        if(BuiltInResponse.length === 0){
            return res.status(500).json({ResponseCode: 500, Message: "Today jobs not found !!"});
        }

        /* JSON 2 CSV */
        let CurrentDate = await getCurrentDate();
        jsonToCsv.json2csv(BuiltInResponse, (err, csv) => {
            if (err) {
                throw err;
            }

            /* Send Email */
            mailOptions.subject = 'Builtin';
            mailOptions.html = 'Builtin Today Jobs';
            mailOptions.attachments = [{filename: `builtin-jobs-${CurrentDate}.csv`, content : csv}];
            mail.sendMail(mailOptions, function(error, info){
                  if (error) {
                    console.log(error);
                  } else {
                    console.log('Email sent: ' + info.response);
                  }
            });
        })

        await browser.close();
        return res.status(200).json({ResponseCode: 200, TotalRecords : BuiltInResponse.length , Data:'builtin-jobs.csv', Message: "Success."});
      } catch (e) {

        console.log('err',e)
        browser.close();
        return res.status(500).json({ResponseCode: 500, Data:[], Message: "Some error occured Or data not found, please try again."});
      }
  }

  /**
      To Auto scroll Page
  **/
  async function autoScroll(page){
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight >= scrollHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
  }

  /**
      To Scroll Pagination Data
  **/
  async function scrapePaginationData(page){

    await page.goto(`https://builtin.com/jobs?page=${PageNo}`, { waitUntil: 'networkidle0', timeout: 0 });
    await page.waitForSelector("div.show_incentive > div", {timeout: 30000});

    await delay(3000);
    await autoScroll(page);

    /* Load Cheerio HTML */
    var $ = cheerio.load(await page.content());
    var IsNextPage = true;
    PageNo = PageNo + 1;
    let totalJobs = $('div.show_incentive > div.job-item').length;
    for (var i = 1; i <= totalJobs; i++) {
        let IsTodayJob = ($('div.show_incentive > div.job-item:nth-child('+i+') > div:nth-child(1) > div.row.no-gutters > div.full-job-row > div.row.basic-info.no-gutters > div.icon-label.info-label.age > span').text().replace(/\n/g, "").trim()).toLowerCase();
        if(IsTodayJob.includes('minutes') || IsTodayJob.includes('minute') || IsTodayJob.includes('hour') || IsTodayJob.includes('hours')){
            let row = {};
            row.JobUrl = $('div.show_incentive > div.job-item:nth-child('+i+') > div:nth-child(1) > div.row.no-gutters > a.job-details-link').attr('href');
            row.Title  = $('div.show_incentive > div.job-item:nth-child('+i+') > div:nth-child(1) > div.row.no-gutters > div.full-job-row > h2.job-title').text().replace(/\n/g, "").replace(/ +(?= )/g,'').trim() || "";
            row.CompanyName  = $('div.show_incentive > div.job-item:nth-child('+i+') > div:nth-child(1) > div.row.no-gutters > div.full-job-row > div.row.basic-info.no-gutters > div.company-title > span').text().replace(/\n/g, "").replace(/ +(?= )/g,'').trim() || "";
            row.Location  = $('div.show_incentive > div.job-item:nth-child('+i+') > div:nth-child(1) > div.row.no-gutters > div.full-job-row > div.row.basic-info.no-gutters > div:nth-child(2) > span').text().replace(/\n/g, "").replace(/ +(?= )/g,'').trim() || "";
            row.Industry  = "";
            row.Website = 'https://builtin.com';
            row.DateTime = IsTodayJob;
            BuiltInResponse.push(row);
        }else if(IsTodayJob.includes('day') || IsTodayJob.includes('days')){
            IsNextPage = false;
            break;
        }
    }

    /* Check Other Pages */
    if(IsNextPage){
        await scrapePaginationData(page);
    }
  }


module.exports = jobsController;
