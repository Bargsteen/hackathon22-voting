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
type Vote = u32;
type VoteCount = u32;

#[derive(Serial, Deserial, Clone, Eq, PartialEq)]
struct Tally {
    result: BTreeMap<VotingOption,VoteCount>,
    total_votes: VoteCount
}

#[derive(Serial, Deserial, Clone, Eq, PartialEq)]
enum VoteState {
    Voting,
    Finalized(Tally),
}

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
#[derive(Serial, Deserial, SchemaType)]
struct VotingView {
    description: Description,
    tally: Tally,
    endtime: Timestamp
}


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

type VotingResult<T> = Result<T, VotingError>;

#[derive(Reject, Serial)]
enum FinalizationError {
    VoteStillActive,
    VoteAlreadyFinalized,
}
type FinalizationResult<T> = Result<T, FinalizationError>;
#[derive(Reject, Serial)]
enum ViewError {
    GenericError,
}
type ViewResult<T> = Result<T, ViewError>;


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

fn get_tally<S: HasStateApi>(options: &Vec<VotingOption>, ballots: &StateMap<AccountAddress, Vote, S>) -> Tally {
    let mut stats: BTreeMap<VotingOption,Vote> = BTreeMap::new();

    for (_,ballot_index) in ballots.iter() {
        let entry = &options[*ballot_index as usize];
        stats.entry(entry.clone()).and_modify(|curr| *curr += 1).or_insert(1);
    }
    let total = stats.values().sum();
    
    Tally{ result: stats, total_votes: total }
}

/// We assume that all ballots contain a valid voteoption index this should be checked by the vote function
/// Assumption: Each account has at most one vote
#[receive(contract = "voting", name = "getvotes")]
fn get_votes<S: HasStateApi>(
    _ctx: &impl HasReceiveContext,
    host: &impl HasHost<State<S>, StateApiType = S>,
) -> ViewResult<VotingView> {
    let tally = get_tally(&host.state().description.options,&host.state().ballots);
    Ok(VotingView{ description: host.state().description.clone(), tally, endtime: host.state().endtime })
}

/// We assume that all ballots contain a valid voteoption index this should be checked by the vote function
/// Assumption: Each account has at most one vote
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

    let tally = get_tally(&host.state().description.options,&host.state().ballots);

    host.state_mut().vote_state = VoteState::Finalized(tally);

    Ok(())
}

// Tests //

#[concordium_cfg_test]
mod tests {
    use super::*;
    use concordium_std::test_infrastructure::*;

    fn get_test_state(config: InitParameter, amount: Amount) -> TestHost<State<TestStateApi>> {
        let mut state_builder = TestStateBuilder::new();
        let state = State {
            description: config.description,
            vote_state: VoteState::Voting,
            ballots: state_builder.new_map(),
            endtime: config.endtime,
        };
        let mut host = TestHost::new(state, state_builder);
        host.set_self_balance(amount);
        host
    }

    #[concordium_test]
    fn test_tally(){
        let options = vec![VotingOption::from("Blue"), VotingOption::from("Bitcoin"), VotingOption::from("Coffee")];
        let mut state_builder = TestStateBuilder::new();
        let mut ballots = state_builder.new_map();
        for i in 0..10{
            ballots.insert(AccountAddress([i as u8; 32]), i % 3);
        }
        let tally = get_tally(&options, &ballots);
        claim_eq!(
            tally.total_votes,
            10,
            "Should count all votes"
        )

    }   

}
