export const props = {
    elastic_http_url: "http://localhost:9200",
    pubman_rest_url: "http://localhost:8080/rest",
    pubman_rest_url_users: "http://localhost:8080/rest/users",
    pubman_rest_url_ous: "http://localhost:8080/rest/ous",
    pubman_rest_url_ctxs: "http://localhost:8080/rest/contexts",
    pubman_rest_url_items: "http://localhost:8080/rest/items",

    blazegraph_sparql_url: "http://localhost:8888/blazegraph/namespace/wf/sparql",
    //blazegraph_sparql_url: "http://b253.demo/blazegraph/namespace/inge/sparql",
    blazegraph_gnd_graph: "http://wf.mpdl.mpg.de/fcrepo",
    cone_journals_graph: "http://cone.mpdl.mpg.de/persons",

    item_index_name: "items",
    item_index_type: "item",
    user_index_name: "users",
    user_index_type: "user",
    ou_index_name: "ous",
    ou_index_type: "organization",
    ctx_index_name: "contexts",
    ctx_index_type: "context",

}