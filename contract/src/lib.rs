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

type VotingResult = ();

#[derive(Serial, Deserial, Clone)]
enum VoteState {
    Voting,
    Finalized(VotingResult),
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

#[receive(contract = "voting", name = "receive")]
fn receive<S: HasStateApi>(
    _ctx: &impl HasReceiveContext,
    _host: &impl HasHost<State<S>, StateApiType = S>,
) -> ReceiveResult<()> {
    Ok(())
}
