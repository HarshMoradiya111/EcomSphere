const fastq = require('fastq');
const { sendMail } = require('../config/mailer');

// The worker function executes our computationally heavy/network-bound tasks
const workerFn = async (task, callback) => {
  try {
    console.log(`[Job Queue] Starting task: ${task.type}`);
    
    if (task.type === 'NEW_ORDER_EMAILS') {
       if (task.userEmail) {
         await sendMail(task.userEmail, task.userSubject, task.userContent);
       }
       if (task.adminEmail) {
         await sendMail(task.adminEmail, task.adminSubject, task.adminContent);
       }
    } else if (task.type === 'LOW_STOCK_ALERT') {
       if (task.adminEmail) {
         await sendMail(task.adminEmail, task.adminSubject, task.adminContent);
       }
    }

    console.log(`[Job Queue] Completed task: ${task.type}`);
    callback(null, { success: true });
  } catch (err) {
    console.error(`[Job Queue] Error executing task ${task.type}:`, err);
    callback(err, null);
  }
};

// Create a powerful concurrency queue (2 workers)
const mailQueue = fastq(workerFn, 2);

module.exports = { mailQueue };
