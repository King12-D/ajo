use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("8WazH2EKrEzrwWwzh4KABve62CtQqKzR25WPa9WDbF3g");

#[program]
pub mod ajo {
    use super::*;

    /// Initialize a new Ajo Score PDA for a trader
    pub fn init_trader(ctx: Context<InitTrader>) -> Result<()> {
        let profile = &mut ctx.accounts.trader_profile;
        profile.trader = ctx.accounts.trader.key();
        profile.score = 300; // Base "Building" score
        profile.consistency = 0;
        profile.revenue_trend = 0;
        profile.expense_discipline = 0;
        profile.bump = ctx.bumps.trader_profile;
        Ok(())
    }

    /// Oracle endpoint to update the trader's score based on Web2 analysis
    pub fn update_score(
        ctx: Context<UpdateScore>,
        score: u16,
        consistency: u8,
        revenue_trend: u8,
        expense_discipline: u8,
    ) -> Result<()> {
        let profile = &mut ctx.accounts.trader_profile;

        // Update the on-chain stats
        profile.score = score;
        profile.consistency = consistency;
        profile.revenue_trend = revenue_trend;
        profile.expense_discipline = expense_discipline;

        Ok(())
    }

    /// Lender pays 0.01 SOL to the trader to query their score
    pub fn query_score_payment(ctx: Context<QueryScorePayment>) -> Result<()> {
        let amount: u64 = 10_000_000; // 0.01 SOL in lamports

        // Execute the SOL transfer via System Program
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.key(),
            system_program::Transfer {
                from: ctx.accounts.lender.to_account_info(),
                to: ctx.accounts.trader.to_account_info(),
            },
        );
        system_program::transfer(cpi_context, amount)?;

        // Emit an event that the lender paid and queried the score
        emit!(ScoreQueriedEvent {
            lender: ctx.accounts.lender.key(),
            trader: ctx.accounts.trader.key(),
            amount,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }
}

/* ── Contexts ────────────────────────────────────────────────── */

#[derive(Accounts)]
pub struct InitTrader<'info> {
    #[account(
        init,
        payer = payer,
        space = TraderProfile::SPACE,
        seeds = [b"profile", trader.key().as_ref()],
        bump
    )]
    pub trader_profile: Account<'info, TraderProfile>,
    /// CHECK: We only need the pubkey to seed the PDA
    pub trader: UncheckedAccount<'info>,
    #[account(mut)]
    pub payer: Signer<'info>, // Could be the trader themselves or the backend paying the fee
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateScore<'info> {
    #[account(
        mut,
        seeds = [b"profile", trader_profile.trader.as_ref()],
        bump = trader_profile.bump
    )]
    pub trader_profile: Account<'info, TraderProfile>,
    #[account(mut)]
    pub oracle: Signer<'info>, // The backend service authorizing the score update
}

#[derive(Accounts)]
pub struct QueryScorePayment<'info> {
    #[account(mut)]
    pub lender: Signer<'info>,
    /// CHECK: The trader receiving the 0.01 SOL
    pub trader: UncheckedAccount<'info>,
    #[account(
        seeds = [b"profile", trader.key().as_ref()],
        bump = trader_profile.bump
    )]
    pub trader_profile: Account<'info, TraderProfile>, // Verify trader actually exists
    pub system_program: Program<'info, System>,
}

/* ── State ───────────────────────────────────────────────────── */

#[account]
pub struct TraderProfile {
    pub trader: Pubkey,
    pub score: u16,
    pub consistency: u8,
    pub revenue_trend: u8,
    pub expense_discipline: u8,
    pub bump: u8,
}

impl TraderProfile {
    // Discriminator (8) + Pubkey (32) + score (2) + 3 * u8 (3) + bump (1) = 46 bytes
    pub const SPACE: usize = 8 + 32 + 2 + 1 + 1 + 1 + 1;
}

/* ── Events ──────────────────────────────────────────────────── */

#[event]
pub struct ScoreQueriedEvent {
    pub lender: Pubkey,
    pub trader: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}
