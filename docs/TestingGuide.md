
# Societal UI Testing Guide

## Create a DAO

- Open Socital UI

- Connect to `development node -->  http://localhost:3000`

<img src="images/Screenshot 2022-12-21 160307.png" width="400" style="padding-left: 50px;">

- Select an account from the top right drop down if one is not selected

- Click on `Create New DAO`

<img src="images/Screenshot 2022-12-21 160307-2.png" width="400" style="padding-left: 50px;">

- Fill in `Create DAO` information
    -   DAO Name
    - Purpose
    - Council Members
    - Quantity of Tokens
    - Name of Token
    - Token Symbol (unique token ticker)
    - Proposal Periods

<img src="images/Screenshot 2022-12-21 161348.png" width="400" style="padding-left: 50px;">

<img src="images/Screenshot 2022-12-21 161609.png" width="400" style="padding-left: 50px;">

- Click `Create DAO`

- Now you can see your DAO on the main dashboard

<img src="images/Screenshot 2022-12-21 161832.png" width="400" style="padding-left: 50px;">


## Create Proposals

- Now let's try to create a proposal. Select the `Create Proposal` button in the the top right

<img src="images/Screenshot 2022-12-21 161832-2.png" width="400" style="padding-left: 50px;">

- Use the dropdown to select the type of Proposal you would like to create:
    - Propose Transfer
    - Propose Add Member
    - Propose Remove Member

- First we will create a Transfer Proposal. Slect he amoun to transfer and the recipient.

<img src="images/Screenshot 2022-12-21 162948.png" width="400" style="padding-left: 50px;">

- Click `Propose` and you will now see the proposal in the main dashboard

<img src="images/Screenshot 2022-12-21 163109.png" width="400" style="padding-left: 50px;">

- Repeat for "Propose Add Member" and "Propose Remove Member" proposals

- Now we will see three prposals on the main dashboard

<img src="images/Screenshot 2022-12-21 163405.png" width="400" style="padding-left: 50px;">
```

### Proposal Voting

- To vote on the proposal, make sure you have one of the council member accounts slected in the top right. Then use the 'thumbs up' and 'thumbs down' icons on the proposal to vote. 

<img src="images/Screenshot 2022-12-21 163405-2.png" width="400" style="padding-left: 50px;">

- You will see the counter increase when the vote is registared. Cycle through all of the Council members listed on the right side to vote. 

<img src="images/Screenshot 2022-12-21 164037.png" width="400" style="padding-left: 50px;">

<img src="images/Screenshot 2022-12-21 164220.png" width="400" style="padding-left: 50px;">

- If the proposal is "passing" it can be ended early, before the end of the Proposal Period for testing purposes. Click on the `Finish` arrow that has appeared.

<img src="images/Screenshot 2022-12-21 164725.png" width="400" style="padding-left: 50px;">

- The proposal will disappear from the list. Notice on the add Members List that Charlie has now been added to the council.

<img src="images/Screenshot 2022-12-21 164956.png" width="400" style="padding-left: 50px;">



## Create New DAO

- To Create a new DAO, use the "+" button on the bottom left. 

<img src="images/Screenshot 2022-12-21 165405.png" width="400" style="padding-left: 50px;">

- You can then repeat the guide with the new DAO and you will see the new DAO on the left navigation bar. 

<img src="images/Screenshot 2022-12-21 165537.png" width="400" style="padding-left: 50px;">
