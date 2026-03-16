#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env};

#[contracttype]
#[derive(Clone, PartialEq)]
pub enum EscrowStatus { Active, Completed, Disputed, Resolved, Refunded }

#[contracttype]
#[derive(Clone)]
pub struct EscrowJob {
    pub client: Address,
    pub freelancer: Address,
    pub token: Address,
    pub total_amount: i128,
    pub released_amount: i128,
    pub milestones: u32,
    pub milestones_released: u32,
    pub status: EscrowStatus,
}

#[contracttype]
pub enum DataKey { Job(u64), Admin }

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    pub fn initialize(_env: Env, _admin: Address) { todo!() }

    /// Client deposits USDC and opens an escrow job.
    pub fn deposit(
        _env: Env, _job_id: u64, _client: Address, _freelancer: Address,
        _token: Address, _amount: i128, _milestones: u32,
    ) { todo!() }

    /// Client approves a milestone — releases proportional USDC to freelancer.
    pub fn release_milestone(_env: Env, _job_id: u64, _caller: Address) { todo!() }

    /// Either party opens a dispute, locking remaining funds.
    pub fn open_dispute(_env: Env, _job_id: u64, _caller: Address) { todo!() }

    /// Admin (AI judge authority) resolves dispute — splits funds by BPS.
    /// `freelancer_share_bps`: 0–10000 (100% = 10000).
    pub fn resolve_dispute(_env: Env, _job_id: u64, _freelancer_share_bps: u32) { todo!() }

    /// Client recoups funds if freelancer never responded.
    pub fn refund(_env: Env, _job_id: u64, _client: Address) { todo!() }

    pub fn get_job(_env: Env, _job_id: u64) -> EscrowJob { todo!() }
}
