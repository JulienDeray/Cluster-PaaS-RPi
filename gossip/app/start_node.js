#!/usr/bin/env node
var advertisement = require('../core/advertisement');
var view = require('../../visualisation');
var gossip_manager = require('./gossip_manager');

var ip = require("ip");
const node_ip = ip.address();

var node_launched = false;

const node_name = require('../core/name_picker').get_node_name();
console.log('>>> node name is :', node_name);

advertisement.start(node_name);
search_node_and_connect();

function search_node_and_connect() {
    advertisement.search_a_node(function (service) {
        if ( service.addresses.indexOf( node_ip ) < 0 && !node_launched) {
            console.log('Node found :');
            console.log('   IP :', service.addresses);
            console.log('   Host :', service.host);
            console.log('   Name :', service.txtRecord.cluster_name);

            console.log('Stop looking for nodes');
            advertisement.stop_searching();

            start_node(service.addresses[0]);
        }
    });
}

function start_node(peer_ip) {
    const node_port = 9000;
    var peer_addr = [peer_ip, node_port].join(':');

    console.log('Connecting to node', peer_addr);

    const local_node_infos = {
        ip : node_ip,
        port : node_port,
        name : node_name
    };

    gossip_manager.start(local_node_infos, peer_addr, function() {
        node_launched = true;
        console.log('Node', local_node_infos.ip, '(' + node_name + ')', 'started');

        view.start_http_server(local_node_infos.ip, gossip_manager);
        return view;
    });
}