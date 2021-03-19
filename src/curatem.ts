import { NewCommunity } from "../generated/Curatem/Curatem"
import { CuratemCommunity, NewSpamPredictionMarket } from "../generated/Curatem/CuratemCommunity"
import { Community, SpamPredictionMarket } from "../generated/schema"
import { SpamPredictionMarket as SpamPredictionMarketContract } from '../generated/Curatem/SpamPredictionMarket'
import { CuratemCommunity as CuratemCommunityTemplate } from '../generated/templates'
import { SpamPredictionMarket as SpamPredictionMarketTemplate } from '../generated/templates'
import { getOrCreateToken } from './token'

// Utils.
import { Address, Bytes, ipfs, JSONValue, log, Value, BigInt } from '@graphprotocol/graph-ts'

export const zero = BigInt.fromI32(0);

export function handleNewCommunity(event: NewCommunity): void {
    const communityAddress = event.params.community

    const community = new Community(communityAddress.toHexString())

    const contract = CuratemCommunity.bind(communityAddress)
    const moderatorArbitrator = contract.moderatorArbitrator()
    const token = contract.token()

    community.moderatorArbitrator = moderatorArbitrator.toHexString()
    community.token = getOrCreateToken(token).id

    CuratemCommunityTemplate.create(communityAddress)

    community.save()
}

