var bodybuilder = require('bodybuilder')
var body = bodybuilder()

body = body 
body = body.query('match_all')
        body = body.sort("affiliations.title.sorted", "asc")

  body = body.sort("name.sorted", "desc")

  body = body.size(10)
  body = body.from(0)
  // body = body.rawOption("_source", {"includes":["metadata.title", "metadata.genre"]})
  body = body.build()
  for (var key in body.sort[0]) {
      console.log("sort field is " + key)
      console.log("sort direction is " + body.sort[0][key].order)
  }
// console.log("and the sort field is: " + JSON.stringify(body.sort[0]));
console.log("and the size is: " + body.size);
console.log("and the from is: " + body.from);
console.log("and the query is: " + JSON.stringify(body.query));
console.log("and all together: " + JSON.stringify(body));
var query = body.query
qzery = {query: query, size: body.size, from: body.from, sort:{"name.sorted": {order: "asc"}}, _source: body._source}
console.log("should be equal 2 " + JSON.stringify(qzery))
