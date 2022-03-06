var assert     = require('assert');
var common     = require('../../common');
var connection = common.createConnection({port: common.fakeServerPort, allowObjectValues: false});

var server = common.createFakeServer();
// As seen in https://maxwelldulin.com/BlogPost?post=9185867776 and https://flattsecurity.medium.com/finding-an-unseen-sql-injection-by-bypassing-escape-functions-in-mysqljs-mysql-90b27f6542b4
// if we pass an object {password: 1} to 'WHERE password = ?', we get the interpolation
// 'WHERE password = `password` = 1', which evaluates as '(password = `password`) = 1'
// which is always true. This is a security footgun, nay, a security foot cannon, so from 3.0
// it should be off by default. But for porting reasons, we would like to release a 2.19 version
// that has this enabled by default with a deprecation warning but has configuration for disabling it.
var sqlQuery = "password = ?"; // doesn't matter that this isn't legal SQL, we're only testing .format()
var values = [{password: 1}];

server.listen(common.fakeServerPort, function (err) {
  assert.ifError(err);

  assert.throws(function() { connection.query(sqlQuery, values); });
  connection.destroy();
  server.destroy();
});
