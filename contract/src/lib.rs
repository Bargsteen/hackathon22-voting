use std::collections::BTreeMap;

use concordium_std::*;

// init
// vote
// finalize
// view functions

#[derive(Serial, Deserial, SchemaType, Clone)]
struct Description {
    description_text: String,
    options: Vec<VotingOption>,
}

type VotingOption = String;

#[derive(Reject, Serial)]
enum VotingError {
    VotingFinished,
    InvalidVoteIndex,
    ParsingFailed,
    ContractVoter,
}

impl From<ParseError> for VotingError {
    fn from(_: ParseError) -> Self {
        VotingError::ParsingFailed
    }
}

type Vote = u32;

#[derive(Serial, DeserialWithState, StateClone)]
#[concordium(state_parameter = "S")]
struct State<S> {
    description: Description,
    vote_state: VoteState,
    ballots: StateMap<AccountAddress, Vote, S>,
    endtime: Timestamp,
}

#[derive(Deserial, SchemaType)]
struct InitParameter {
    description: Description,
    endtime: Timestamp,
}

#[derive(Serial, Deserial, Clone, Eq, PartialEq)]
struct FinalTally {
    winner: Option<VotingOption>,
    stats: BTreeMap<VotingOption,Vote>,
}

type VotingResult<T> = Result<T, VotingError>;

#[derive(Reject, Serial)]
enum FinalizationError {
    VoteStillActive,
    VoteAlreadyFinalized,
}
type FinalizationResult<T> = Result<T, FinalizationError>;

#[derive(Serial, Deserial, Clone, Eq, PartialEq)]
enum VoteState {
    Voting,
    Finalized(FinalTally),
}

#[init(contract = "voting", parameter = "InitParameter")]
fn init<S: HasStateApi>(
    ctx: &impl HasInitContext,
    state_builder: &mut StateBuilder<S>,
) -> InitResult<State<S>> {
    let param: InitParameter = ctx.parameter_cursor().get()?;
    Ok(State {
        description: param.description,
        vote_state: VoteState::Voting,
        ballots: state_builder.new_map(),
        endtime: param.endtime,
    })
}

#[receive(contract = "voting", name = "vote", mutable, parameter = "Vote")]
fn vote<S: HasStateApi>(
    ctx: &impl HasReceiveContext,
    host: &mut impl HasHost<State<S>, StateApiType = S>,
) -> VotingResult<()> {
    // Check that the election hasn't finished yet.
    if ctx.metadata().slot_time() > host.state().endtime
        || matches!(host.state().vote_state, VoteState::Finalized(_))
    {
        return Err(VotingError::VotingFinished);
    }
    // Ensure that the sender is an account.
    let acc = match ctx.sender() {
        Address::Account(acc) => acc,
        Address::Contract(_) => return Err(VotingError::ContractVoter),
    };
    let new_vote: Vote = ctx.parameter_cursor().get()?;

    // check that vote is in range
    ensure!(
        (new_vote as usize) < host.state().description.options.len(),
        VotingError::InvalidVoteIndex
    );

    // Insert or replace the vote for the account.
    host.state_mut()
        .ballots
        .entry(acc)
        .and_modify(|vote| *vote = new_vote)
        .or_insert(new_vote);
    Ok(())
}

#[receive(contract = "voting", mutable, name = "finalize")]
fn finalize<S: HasStateApi>(
    ctx: &impl HasReceiveContext,
    host: &mut impl HasHost<State<S>, StateApiType = S>,
) -> FinalizationResult<()> {
    // Ensure the auction has not been finalized yet
    ensure_eq!(
        host.state().vote_state,
        VoteState::Voting,
        FinalizationError::VoteAlreadyFinalized
    );

    let slot_time = ctx.metadata().slot_time();
    // Ensure the auction has ended already
    ensure!(slot_time > host.state().endtime, FinalizationError::VoteStillActive);

    let mut stats: BTreeMap<VotingOption,Vote> = BTreeMap::new();

    for (addr, ballot_index) in &mut host.state().ballots.iter() {
        let entry = &host.state().description.options[*ballot_index as usize];
        stats.entry(entry.clone()).and_modify(|curr| *curr += 1).or_insert(1);
    }

    let mut winner: Option<VotingOption> = None;
    let mut max = 0;
    for (entry, count) in &stats {
        if *count > max {
            winner = Some(entry.clone());
            max = *count;
        }
    }

    let tally = FinalTally{ winner, stats };

    host.state_mut().vote_state = VoteState::Finalized(tally);

    Ok(())
}
