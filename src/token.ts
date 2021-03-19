import { ERC20 as TokenContract } from '../generated/Curatem/ERC20'
import { Address } from '@graphprotocol/graph-ts'
import { Token } from '../generated/schema'

export function getOrCreateToken(address: Address): Token {
    let token = Token.load(address.toHexString()) as Token
    if (token != null) {
        return token
    } else {
        token = new Token(address.toHexString())
    }

    const erc20 = TokenContract.bind(address)
    const name = erc20.try_name()
    const symbol = erc20.try_symbol()
    const decimals = erc20.try_decimals()

    if (!name.reverted) {
        token.name = name.value
    }
    if (!symbol.reverted) {
        token.symbol = symbol.value
    }
    if (!decimals.reverted) {
        token.decimals = decimals.value
    }

    token.save()

    return token
}