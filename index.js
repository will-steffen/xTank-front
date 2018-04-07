const PORT = process.env.PORT || 5000
var express = require('express');
var app = express();

// app.get('/', function (req, res) {
//   res.send('Hello World!');
// });

app.use(express.static('./'));

app.listen(PORT, function () {
  console.log('Example app listening on port '+PORT+'!');
});