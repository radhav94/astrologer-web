# Requirements Document

## Introduction

Modify the withdrawal flow in the React application so that clicking "Withdraw Money" on the `WithdrawMoney` page no longer calls the withdrawal API directly. Instead, it navigates to the `/confirm-withdrawal` route, passing the entered amount, selected withdrawal type, and selected bank account data via React Router navigation state. The `ConfirmWithdrawal` page already exists and handles the actual API call.

## Glossary

- **WithdrawMoney_Page**: The screen at `/withdraw-money` where the user enters a withdrawal amount, selects a withdrawal type, and picks a bank account.
- **ConfirmWithdrawal_Page**: The screen at `/confirm-withdrawal` that receives withdrawal details via navigation state and executes the withdrawal API call.
- **Navigation_State**: The state object passed via React Router's `navigate` function, containing `{ amount, withdrawalType, account }`.
- **Withdraw_Button**: The primary action button on the WithdrawMoney_Page labeled "Withdraw Money".

## Requirements

### Requirement 1: Navigate to Confirmation Instead of Calling API

**User Story:** As a user, I want clicking "Withdraw Money" to take me to a confirmation page, so that I can review my withdrawal details before the request is submitted.

#### Acceptance Criteria

1. WHEN the user clicks the Withdraw_Button with a valid amount and a selected bank account, THE WithdrawMoney_Page SHALL navigate to `/confirm-withdrawal` instead of calling the withdrawal API.
2. WHEN navigating to the ConfirmWithdrawal_Page, THE WithdrawMoney_Page SHALL pass a Navigation_State object containing `amount`, `withdrawalType`, and the full selected bank `account` object.
3. THE Navigation_State `amount` field SHALL contain the raw numeric amount entered by the user.
4. THE Navigation_State `withdrawalType` field SHALL contain the selected withdrawal type string (`"instant"` or `"standard"`).
5. THE Navigation_State `account` field SHALL contain the complete bank account object for the selected account.

### Requirement 2: Remove Direct Withdrawal API Usage from WithdrawMoney Page

**User Story:** As a developer, I want the WithdrawMoney page to have no dependency on the withdrawal API mutation, so that the page is only responsible for collecting input and navigating.

#### Acceptance Criteria

1. THE WithdrawMoney_Page SHALL NOT import or invoke `useWithdrawRequestMutation`.
2. THE WithdrawMoney_Page SHALL NOT contain any withdrawal API call logic.

### Requirement 3: Simplify Button State on WithdrawMoney Page

**User Story:** As a user, I want the "Withdraw Money" button to reflect only input validation state, so that I am not confused by loading indicators for an API call that no longer happens on this page.

#### Acceptance Criteria

1. THE Withdraw_Button SHALL be disabled WHEN no amount is entered, or the amount is zero or negative, or the amount exceeds the wallet balance, or no bank account is selected.
2. THE Withdraw_Button SHALL NOT display a loading or "Processing..." state, since no API call occurs on the WithdrawMoney_Page.
3. THE Withdraw_Button SHALL always display the text "Withdraw Money" with a chevron icon.
