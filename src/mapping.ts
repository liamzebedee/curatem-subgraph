import { MarketCreated } from '../generated/Curatem/Curatem'
import { CuratemCommunity } from '../generated/Curatem/CuratemCommunity'
import { Market, Community } from '../generated/schema'
import { Address, Bytes, ipfs, JSONValue, log, Value } from '@graphprotocol/graph-ts'


export function handleMarketCreated(event: MarketCreated): void {
  // Recover multihash.
  // A multihash consists of a series of three varints:
  // (digest fn code/id, digest length, digest)
  // We encode assumptions of the first two.
  // 00701220
  // cid-version  = 00 (v0)
  // multicodec   = 70 (dag-pb)
  // digest fn    = 12 (sha256)
  // digest lengh = 20 (32 bytes)
  const communityId = event.params.community
  const hashDigest = event.params.hashDigest
  const conditionId = event.params.conditionId
  const questionId = event.params.questionId
  
  const cid = Bytes.fromHexString(`1220` + hashDigest.toHexString().slice(2)).toBase58()
  log.info("New market with CID {}", [cid])

  // TODO: Re-enable IPFS pinning when it is deterministic.
  // ipfs.mapJSON(cid.toBase58(), 'processIpfsMetadata', Value.fromString(marketId))
  // const metadata = ipfs.cat(cid.toString())
  // const js = Value.fromBytes(metadata as Bytes)
  // log.info("{}", [js.toString()])

  const community = getOrCreateCommunity(communityId)

  let market = new Market(cid)
  market.metadataCID = cid
  market.community = community.id
  market.conditionId = conditionId.toHexString()
  market.questionId = questionId.toHexString()
  market.save()
}


function getOrCreateCommunity(address: Address): Community {
  let community = Community.load(address.toHexString()) as Community
  if (community != null) {
    return community as Community
  } else {
    community = new Community(address.toHexString())
  }

  const contract = CuratemCommunity.bind(address)
  const moderator = contract.moderator()
  const token = contract.token()

  community.moderator = moderator.toHexString()
  community.token = token.toHexString()
  
  community.save()
  return community
}

// export function processIpfsMetadata(value: JSONValue, userData: Value): void {
//   const marketId = userData.toString()
//   let market = Market.load(marketId)
//   market.metadata = value.data.toString()
//   market.save()
// }