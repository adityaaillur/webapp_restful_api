const AWS = require('aws-sdk');
const cloudwatch = new AWS.CloudWatch({ region: 'us-east-1' });

// In each API method, add the following code to increment the counter
const apiCallCounter = (req, res, next) => {
    const apiName = req.method + '-' + req.path; // Use HTTP method and path as API name
    cloudwatch.putMetricData({
      MetricData: [
        {
          MetricName: 'API-Call-Count',
          Dimensions: [
            {
              Name: 'Web-API',
              Value: apiName
            }
          ],
          Unit: 'Count',
          Value: 1
        }
      ],
      Namespace: 'Custom-Metrics'
    }, function(err, data) {
      if (err) {
        console.log('Error sending metrics to CloudWatch:', err);
      } else {
        console.log('Metrics sent to CloudWatch:', data);
      }
    });
    next(); // Pass the request to the next middleware or API handler
  }
  
  module.exports = apiCallCounter;
