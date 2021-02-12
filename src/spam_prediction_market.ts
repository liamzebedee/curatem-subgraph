import { log } from "@graphprotocol/graph-ts";
import { Finalized, Initialized, PoolCreated, SharesBought, SharesRedeemed, SharesSold } from '../generated/templates/SpamPredictionMarket/SpamPredictionMarket'

export function handleInitialized(event: Initialized): void {
    log.info("handleInitialized", [])
}

export function handlePoolCreated(event: PoolCreated): void {
    log.info("handlePoolCreated", [])
}

export function handleSharesBought(event: SharesBought): void {
    log.info("handleSharesBought", [])
}

export function handleSharesSold(event: SharesSold): void {
    log.info("handleSharesSold", [])
}

export function handleFinalized(event: Finalized): void {
    log.info("handleFinalized", [])
}

export function handleSharesRedeemed(event: SharesRedeemed): void {
    log.info("handleSharesRedeemed", [])
}
