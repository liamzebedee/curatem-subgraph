import { NewCommunity } from "../generated/Curatem/Curatem"
import { CuratemCommunity, NewSpamPredictionMarket } from "../generated/Curatem/CuratemCommunity"
import { Community, SpamPredictionMarket } from "../generated/schema"
import { SpamPredictionMarket as SpamPredictionMarketContract } from '../generated/Curatem/SpamPredictionMarket'
import { CuratemCommunity as CuratemCommunityTemplate } from '../generated/templates'
import { SpamPredictionMarket as SpamPredictionMarketTemplate } from '../generated/templates'
import { getOrCreateToken } from './token'

// Utils.
import { Address, Bytes, ipfs, JSONValue, log, BigInt } from '@graphprotocol/graph-ts'

export const zero = BigInt.fromI32(0);

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
    market.finalized = false
    market.sharesMinted = zero;
    market.sharesRedeemed = zero;
    market.save()

    SpamPredictionMarketTemplate.create(event.params.market)
}

export function getOrCreateCommunity(address: Address): Community {
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