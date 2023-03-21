
# Societal UI Democracy Testing Guide

## Create a DAO

- Open Socital UI

- Connect to `dev instance --> https://client.dev.sctl.link/`

<img src="images/democracy/Screenshot 2023-03-21 at 16.40.51.png" width="600" style="padding-left: 50px;">

- Use the 'Connect Wallet' btn in the top right corner of the application and select the account from the list of 'Development Accounts' (pre-funded dev accounts are: Alice/Bob/Charlie/Dave)

<img src="images/democracy/Screenshot 2023-03-21 at 16.42.22.png" width="600" style="padding-left: 50px;">

- Click on the plus btn in the bottom left corner to start creating a new DAO.

- Fill in `Create DAO` information
    -   DAO Name
    - Purpose
    - Council Members

- Select 'Fungible Token' in 'Select Governance Token'

<img src="images/democracy/Screenshot 2023-03-21 at 16.52.50.png" width="600" style="padding-left: 50px;">

- Fill in token properties
    - Quantity of Tokens
    - Name of Token
    - Token Symbol (unique token ticker)

- Select 'Approve Origin' and 'Proposal Period' for your council proposals:

<img src="images/democracy/Screenshot 2023-03-21 at 16.56.02.png" width="600" style="padding-left: 50px;">

- Continue with democracy settings. Use small values for democracy periods to be able to perform tests in a reasonable time(5 mins is enough).

    - Voting Period (5 mins)
    - Enactmnet Period (5 mins)
    - Vote Locking Period (5 mins)
    - Launch Period (5 mins)

<img src="images/democracy/Screenshot 2023-03-21 at 17.06.21.png" width="600" style="padding-left: 50px;">

- Click `Create DAO`

- Wait for approximately 2 block times(in our case it is 6 seconds for a block) for the DAO to appear on the dashboard.

## Distribute DAO Governance Token

### Proposal Submission

Let's create proposals to distribute DAO governance token:

- Click on `Create Proposal` button

<img src="images/democracy/Screenshot 2023-03-21 at 17.25.27.png" width="600" style="padding-left: 50px;">

- Use the following settings for the proposal:

<img src="images/democracy/Screenshot 2023-03-21 at 17.27.57.png" width="600" style="padding-left: 50px;">

- Wait for approximately 2 block times(in our case it is 6 seconds for a block) for the proposal to appear on the dashboard.

<img src="images/democracy/Screenshot 2023-03-21 at 17.31.27.png" width="600" style="padding-left: 50px;">

- Go to the `Governance` section to start voting

<img src="images/democracy/Screenshot 2023-03-21 at 17.32.57.png" width="600" style="padding-left: 50px;">

- Press `Thumbs Up` btn to vote `aye` for the proposal and wait until the counter increases to make sure your vote is counted

<img src="images/democracy/Screenshot 2023-03-21 at 17.35.14.png" width="600" style="padding-left: 50px;">

- Add more votes with different accounts to make sure the voting is above the `Approve Origin` threshold you defined in DAO settings.

- Click `Finish` button to close the proposal

- Go back to `DAO Dashboard` and observe the DAO token balance and your account governance token balance

<img src="images/democracy/Screenshot 2023-03-21 at 17.36.40.png" width="600" style="padding-left: 50px;">

## Democracy Proposals

### Proposal Submission

Now let's try to make use of a DAO Governance token via DAO Democracy Pallet:

- Click on `Create Proposal` button and use the following settings for the proposal:

<img src="images/democracy/Screenshot 2023-03-21 at 17.42.31.png" width="600" style="padding-left: 50px;">

- Click `Submit` and wait unit the proposal shows up on the dashboard:

<img src="images/democracy/Screenshot 2023-03-21 at 17.44.49.png" width="600" style="padding-left: 50px;">

- Go to `Governance` section and wait until the proposal becomes the referendum

<img src="images/democracy/Screenshot 2023-03-21 at 17.45.45.png" width="600" style="padding-left: 50px;">

### Referendum Voting

- Go to `Governance --> Referendum` to start voting

<img src="images/democracy/Screenshot 2023-03-21 at 17.48.44.png" width="600" style="padding-left: 50px;">

- Use some amount of governance tokens to vote `aye` for the proposal

<img src="images/democracy/Screenshot 2023-03-21 at 17.49.18.png" width="600" style="padding-left: 50px;">

- Observe that token that you voted with are now locked

<img src="images/democracy/Screenshot 2023-03-21 at 17.59.27.png" width="600" style="padding-left: 50px;">

### Referendum Execution

- Wait for up to ~10 minutes to make sure the referendum succeeds(taking into account voting period + enactment period you defined in DAO settings)

<img src="images/democracy/Screenshot 2023-03-21 at 17.59.27.png" width="600" style="padding-left: 50px;">

### Vote Revocation

- Go to `Governance --> Referendum` section and click `Revoke Vote` on the referendum that just has finished.

<img src="images/democracy/Screenshot 2023-03-21 at 17.58.30.png" width="600" style="padding-left: 50px;">

- `Revoke Vote` button becomes disabled - it means that the operation succeeded.

### Unlock Tokens

- Go to `Dashboard` and observe that your token are still in `frozen` state.

<img src="images/democracy/Screenshot 2023-03-21 at 18.09.50.png" width="600" style="padding-left: 50px;">

- Click `unlock` button and observe that tokens has moved from `frozen` state

<img src="images/democracy/Screenshot 2023-03-21 at 18.11.09.png" width="600" style="padding-left: 50px;">
