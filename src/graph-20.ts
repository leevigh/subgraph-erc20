import { BigInt } from "@graphprotocol/graph-ts"
import {
  Graph20,
  Approval as ApprovalEvent,
  OwnershipTransferred,
  Transfer as TransferEvent
} from "../generated/Graph20/Graph20"
import { 
  Token,
  Account,
  Transfer,
  Approval } from "../generated/schema"

export function handleApproval(event: ApprovalEvent): void {
  // Create a new Approval entity to record this event
  let approval = new Approval(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  approval.owner = event.params.owner.toHexString();
  approval.spender = event.params.spender.toHexString();
  approval.value = event.params.value;
  approval.timestamp = event.block.timestamp;
  approval.block = event.block.number;
  approval.save();

  // BigInt and BigDecimal math are supported
  // entity.count = entity.count + BigInt.fromI32(1)

  // Entity fields can be set based on event parameters
  // entity.owner = event.params.owner
  // entity.spender = event.params.spender

  // Entities can be written to the store with `.save()`
  // entity.save()

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.allowance(...)
  // - contract.approve(...)
  // - contract.balanceOf(...)
  // - contract.decimals(...)
  // - contract.name(...)
  // - contract.owner(...)
  // - contract.symbol(...)
  // - contract.totalSupply(...)
  // - contract.transfer(...)
  // - contract.transferFrom(...)
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handleTransfer(event: TransferEvent): void {
  // Load the Token entity
  let token = Token.load("1");
  if (!token) {
    // If the Token entity doesn't exist, create it with initial values
    token = new Token("1");
    token.name = "GRAPH20";
    token.symbol = "GRP";
    token.decimals = 18;
    token.totalSupply = BigInt.fromI32(0);
  }
  token.save();

  // Handle the 'from' account
  let fromAccount = Account.load(event.params.from.toHexString());
  if (!fromAccount) {
    // If the 'from' account doesn't exist, create it
    fromAccount = new Account(event.params.from.toHexString());
    fromAccount.balance = BigInt.fromI32(0);
  }
  // Decrease the balance of the 'from' account
  fromAccount.balance = fromAccount.balance.minus(event.params.value);
  fromAccount.save();

  // Handle the 'to' account
  let toAccount = Account.load(event.params.to.toHexString());
  if (!toAccount) {
    // If the 'to' account doesn't exist, create it
    toAccount = new Account(event.params.to.toHexString());
    toAccount.balance = BigInt.fromI32(0);
  }
  // Increase the balance of the 'to' account
  toAccount.balance = toAccount.balance.plus(event.params.value);
  toAccount.save();

  // Create a new Transfer entity to record this event
  let transfer = new Transfer(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  transfer.from = fromAccount.id;
  transfer.to = toAccount.id;
  transfer.value = event.params.value;
  transfer.timestamp = event.block.timestamp;
  transfer.block = event.block.number;
  transfer.save();
}
