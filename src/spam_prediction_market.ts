import { log } from "@graphprotocol/graph-ts";
import { SpamPredictionMarket } from '../generated/schema'
import { Finalized, Initialized, SharesBought, SharesRedeemed, SharesSold } from '../generated/templates/SpamPredictionMarket/SpamPredictionMarket'

export function handleInitialized(event: Initialized): void {
    log.info("handleInitialized", [])
}

export function handleSharesBought(event: SharesBought): void {
    log.info("handleSharesBought", [])
    let market = SpamPredictionMarket.load(event.address.toHexString()) as SpamPredictionMarket
    market.sharesMinted = market.sharesMinted.plus(event.params.amount)
    market.save()
}

export function handleSharesSold(event: SharesSold): void {
    log.info("handleSharesSold", [])
}

export function handleFinalized(event: Finalized): void {
    let market = SpamPredictionMarket.load(event.address.toHexString()) as SpamPredictionMarket
    market.finalized = true
    market.save()
    log.info("handleFinalized", [])
}

export function handleSharesRedeemed(event: SharesRedeemed): void {
    log.info("handleSharesRedeemed", [])
    let market = SpamPredictionMarket.load(event.address.toHexString()) as SpamPredictionMarket
    market.sharesRedeemed = market.sharesRedeemed.plus(event.params.amount);
    market.save()
}
