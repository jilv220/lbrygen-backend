import "gun/lib/axe";
const Gun = require('gun')

export let gun;
const GUN_PEERS = 
[
  'https://gun-rs.iris.to/gun',
  'https://relay.peer.ooo/gun',
  'https://gun-us.herokuapp.com/gun'
]

export function useGun(opts?) {

  if (!gun) {
    gun = Gun({peers: GUN_PEERS, ...opts})
  }

  return gun;
}

export function init(server) {
  useGun({web: server})
}

export default {
  init
}