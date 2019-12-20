const Promise = require('bluebird');
const fs = require('fs-extra');
const request = require('request');

module.exports = (api) => {
  /**
   * Promise based download file method
   */
  api.downloadFile = (configuration) => {
    return new Promise((resolve, reject) => {
      // Save variable to know progress
      let receivedBytes = 0;
      let totalBytes = 0;

      const req = request({
        method: 'GET',
        uri: configuration.remoteFile,
        agentOptions: {
          keepAlive: true,
          keepAliveMsecs: 15000,
        },
      });

      let out = fs.createWriteStream(configuration.localFile);
      req.pipe(out);

      req.on('response', (data) => {
        // Change the total bytes value to get progress later.
        totalBytes = parseInt(data.headers['content-length']);
      });

      // Get progress if callback exists
      if (configuration.hasOwnProperty('onProgress')) {
        req.on('data', (chunk) => {
          // Update the received bytes
          receivedBytes += chunk.length;
          configuration.onProgress(receivedBytes, totalBytes);
        });
      } else {
        req.on('data', (chunk) => {
          // Update the received bytes
          receivedBytes += chunk.length;
        });
      }

      req.on('end', () => {
        resolve();
      });
    });
  }

  return api;
};