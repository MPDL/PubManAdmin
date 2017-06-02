var jwt = require('jsonwebtoken');
var token = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJmcmFuayIsImlkIjoidXNlcl8zMDAwMDU5IiwiZXhwIjoxNDk2MzE3NDEwLCJpYXQiOjE0OTYzMTAyMTB9.S8S5v7DoHFmSbdLWnI1ZQdBwhDGh9_v35vU2nWQg6Vj_P50XaKUEh7EsR8bllFYtIE7SgQWYldfxgtD_2dbqOQ";
var verified = jwt.verify(token, 'blabla');
console.log(verified.id);
var decoded = jwt.decode(token, {complete: true});
console.log(decoded.header);
console.log(decoded.payload.sub)