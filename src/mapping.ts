// Schemas.
import { Market, Community, SpamPredictionMarket } from '../generated/schema'

// Contracts.
import { NewCommunity } from '../generated/Curatem/Curatem'
import { CuratemCommunity, MarketCreated, NewSpamPredictionMarket } from '../generated/Curatem/CuratemCommunity'
import { SpamPredictionMarket as SpamPredictionMarketContract } from '../generated/Curatem/SpamPredictionMarket'

// Template data source.
import { CuratemCommunity as CuratemCommunityTemplate } from '../generated/templates'
import { SpamPredictionMarket as SpamPredictionMarketTemplate } from '../generated/templates'

// Utils.
import { Address, Bytes, ipfs, JSONValue, log, Value } from '@graphprotocol/graph-ts'

export function handleNewCommunity(event: NewCommunity): void {
  const communityAddress = event.params.community
  
  const community = new Community(communityAddress.toHexString())

  const contract = CuratemCommunity.bind(communityAddress)
  const moderatorArbitrator = contract.moderatorArbitrator()
  const token = contract.token()

  community.moderatorArbitrator = moderatorArbitrator.toHexString()
  community.token = token.toHexString()

  CuratemCommunityTemplate.create(communityAddress)
  
  community.save()
}

export function handleNewSpamPM(event: NewSpamPredictionMarket): void {
  const communityAddress = event.address
  const address = event.params.market
  const hashDigest = event.params.hashDigest
  const questionId = event.params.questionId


  const community = getOrCreateCommunity(communityAddress)
  let communityContract = CuratemCommunity.bind(communityAddress)
  const itemUrl = communityContract.getUrl(hashDigest)  
  log.info("New market for URL {}", [itemUrl])

  let market = new SpamPredictionMarket(address.toHexString())
  let marketContract = SpamPredictionMarketContract.bind(address)
  market.spamToken = marketContract.spamToken().toHexString()
  market.notSpamToken = marketContract.notSpamToken().toHexString()
  market.community = community.id
  market.questionId = questionId.toHexString()
  market.itemUrl = itemUrl
  market.createdAt = event.block.timestamp.toI32()
  market.save()

  SpamPredictionMarketTemplate.create(event.params.market)
}

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
  const communityAddress = event.address
  const hashDigest = event.params.hashDigest
  const conditionId = event.params.conditionId
  const questionId = event.params.questionId
  const fixedProductMarketMaker = event.params.fixedProductMarketMaker
  

  const community = getOrCreateCommunity(communityAddress)
  let communityContract = CuratemCommunity.bind(communityAddress)
  const itemUrl = communityContract.getUrl(hashDigest)

  const cid = Bytes.fromHexString(`1220` + hashDigest.toHexString().slice(2)).toBase58()
  
  log.info("New market for URL {}", [itemUrl])

  // TODO: Re-enable IPFS pinning when it is deterministic.
  // ipfs.mapJSON(cid.toBase58(), 'processIpfsMetadata', Value.fromString(marketId))
  // const metadata = ipfs.cat(cid.toString())
  // const js = Value.fromBytes(metadata as Bytes)
  // log.info("{}", [js.toString()])
  

  let market = new Market(cid)
  market.metadataCID = cid
  market.community = community.id
  market.conditionId = conditionId.toHexString()
  market.questionId = questionId.toHexString()
  market.fixedProductMarketMaker = fixedProductMarketMaker.toHexString()
  market.itemUrl = itemUrl
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
  const moderatorArbitrator = contract.moderatorArbitrator()
  const token = contract.token()

  community.moderatorArbitrator = moderatorArbitrator.toHexString()
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