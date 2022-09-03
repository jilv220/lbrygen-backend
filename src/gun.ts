import "gun/lib/axe";
import "gun/lib/yson";  // Fix json blocking cpu
const Gun = require('gun')

export let gun;
export const serve = Gun.serve

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

export function init(server, host) {
  useGun({web: server, host: host})
}

export default {
  init,
  serve
}