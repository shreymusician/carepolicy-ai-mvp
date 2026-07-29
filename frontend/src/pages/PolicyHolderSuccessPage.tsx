import { AuthSuccessScreen } from '../components/AuthSuccessScreen'

export function PolicyHolderSuccessPage() {
  return (
    <AuthSuccessScreen
      role="policy_holder"
      loginPath="/policy-holder"
      message="You have successfully signed in to MyInsurance."
    />
  )
}
