#!/usr/bin/env node
var advertisement = require('../core/advertisement');
var Gossiper = require('../lib/node-gossip').Gossiper;

var ip = require("ip");
var node_addr = ip.address();

var node_launched = false;

var opts = require("nomnom")
    .script("start_cluster_node")
    .options({
        name: {
            position: 0,
            required: true,
            help: "Node's name"
        }
    }).parse();

advertisement.start(opts.name);
search_node_and_connect();

function search_node_and_connect() {
    advertisement.search_a_node(function (service) {
        if ( service.addresses.indexOf( node_addr ) < 0 && !node_launched) {
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

function start_node(host) {
    var node_port = 9000;
    var addr = [host, node_port].join(':');

    console.log('Connecting to node', addr);
    var g = new Gossiper(node_port, [addr]);

    g.on('new_peer', function(peer_name) {
        console.log('New peer :', peer_name);
    });

    g.on('peer_alive', function(peer_name) {
        console.log('Peer alive :', peer_name);
    });

    g.on('peer_failed', function(peer_name) {
        console.log('Peer_failed :', peer_name);
    });

    g.start();
    node_launched = true;
    console.log('Node', node_port, 'started');
}