"use strict";

/*
 * Purpose : For Jobs API's Routing 
 * Package : Router
 * Developed By  : Sorav Garg (soravgarg123@gmail.com)
*/

const express  = require('express'),
      router   = express.Router(),
      jobs = require('../controllers/jobsController');

      /* Jobs Routings */
      router.get(['/nodesk-jobs'],jobs.nodesk); 
      router.get(['/himalayas-jobs'],jobs.himalayas); 
      router.get(['/flex-jobs'],jobs.flex); 
      router.get(['/builtin-jobs'],jobs.builtin); 

module.exports = router;      