# Implementation Plan: Withdraw Confirm Redirect

## Overview

Modify `WithdrawMoney.jsx` to navigate to `/confirm-withdrawal` with state instead of calling the withdrawal API directly. This is a localized change to a single file.

## Tasks

- [x] 1. Modify WithdrawMoney.jsx to navigate instead of calling API
  - [x] 1.1 Remove `useWithdrawRequestMutation` import and usage, remove `isWithdrawing` state
    - Remove the import of `useWithdrawRequestMutation` from the bankAccountApi import line
    - Remove the `const [withdrawRequest, { isLoading: isWithdrawing }] = useWithdrawRequestMutation();` line
    - _Requirements: 2.1, 2.2_
  - [x] 1.2 Replace `handleWithdraw` function body with navigation logic
    - Change `handleWithdraw` from an async API call to a synchronous function that calls `navigate("/confirm-withdrawal", { state: { amount: Number(amount), withdrawalType, account: selectedAcc } })`
    - Keep the existing guard check for valid inputs at the top of the function
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  - [x] 1.3 Simplify the Withdraw button disabled logic and text
    - Remove `isWithdrawing` from the button's `disabled` condition
    - Remove the ternary for "Processing..." text — button should always show "Withdraw Money" with chevron icon
    - _Requirements: 3.1, 3.2, 3.3_

- [x] 2. Checkpoint - Verify the changes
  - Ensure the app builds without errors, ask the user if questions arise.

- [ ] 3. Add tests for the modified WithdrawMoney component
  - [ ]* 3.1 Write property test: Navigation carries correct state
    - **Property 1: Navigation carries correct state**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**
  - [ ]* 3.2 Write property test: Button disabled for invalid inputs
    - **Property 2: Button disabled for invalid inputs**
    - **Validates: Requirements 3.1**
  - [ ]* 3.3 Write unit tests for static checks
    - Verify `useWithdrawRequestMutation` is not used in the component
    - Verify button text is always "Withdraw Money"
    - _Requirements: 2.1, 2.2, 3.2, 3.3_

- [ ] 4. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- The only file being modified is `src/screens/private/Profile/withdraw/WithdrawMoney.jsx`
- `ConfirmWithdrawal.jsx` and `Paths.js` require no changes
- Property tests should use `fast-check` with minimum 100 iterations
