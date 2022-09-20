use concordium_std::*;

// init
// vote
// finalize
// view functions

type State = ();

#[init(contract = "voting")]
fn init<S: HasStateApi>(
    _ctx: &impl HasInitContext,
    _state_builder: &mut StateBuilder<S>,
) -> InitResult<()> {
    Ok(())
}

#[receive(contract = "voting", name = "receive")]
fn receive<S: HasStateApi>(
    _ctx: &impl HasReceiveContext,
    _host: &impl HasHost<State, StateApiType = S>,
) -> ReceiveResult<()> {
    Ok(())
}
