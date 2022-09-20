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
    AlreadyFinalized,
    InvalidVoteIndex,
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

type FinalTally = ();
type VotingResult<T> = Result<T, VotingError>;

#[derive(Reject, Serial)]
enum FinalizationError {
    VoteStillActive,
    VoteAlreadyFinalized,
}
type FinalizationResult<T> = Result<T, FinalizationError>;

#[derive(Serial, Deserial, Clone, Eq)]
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

#[receive(contract = "voting", name = "vote", parameter = "Vote")]
fn vote<S: HasStateApi>(
    _ctx: &impl HasReceiveContext,
    _host: &impl HasHost<State<S>, StateApiType = S>,
) -> VotingResult<()> {
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
    ensure!(slot_time > host.state().end, FinalizationError::VoteStillActive);
    Ok(())

    
}
