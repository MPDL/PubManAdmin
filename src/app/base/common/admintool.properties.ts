export const props = {
    elastic_http_url: "https://qa.inge.mpdl.mpg.de/es",
    pubman_rest_url: "https://qa.inge.mpdl.mpg.de/rest",
    pubman_rest_url_users: "https://qa.inge.mpdl.mpg.de/rest/users",
    pubman_rest_url_ous: "https://qa.inge.mpdl.mpg.de/rest/ous",
    pubman_rest_url_ctxs: "https://qa.inge.mpdl.mpg.de/rest/contexts",
    pubman_rest_url_items: "https://qa.inge.mpdl.mpg.de/rest/items",

    item_index_name: "items",
    item_index_type: "item",
    user_index_name: "users",
    user_index_type: "user",
    ou_index_name: "ous",
    ou_index_type: "organization",
    ctx_index_name: "contexts",
    ctx_index_type: "context",

    blazegraph_sparql_url: "http://localhost:8888/blazegraph/namespace/wf/sparql",
    //blazegraph_sparql_url: "http://b253.demo/blazegraph/namespace/inge/sparql",
    blazegraph_gnd_graph: "http://wf.mpdl.mpg.de/fcrepo",
    cone_journals_graph: "http://cone.mpdl.mpg.de/persons",
}