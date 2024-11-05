const express = require('express');
const request = require('request');
const app = express();
const PORT = process.env.PORT || 3000;

app.use('/api', (req, res) => {
  const url = 'https://ibelong.byui.edu/mobile_ws/v17/mobile_events_list';
  request({ url, method: req.method, json: true }, (error, response, body) => {
    if (error) {
      return res.status(500).send(error);
    }
    res.set('Access-Control-Allow-Origin', '*'); // Allow all origins
    res.json(body);
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
