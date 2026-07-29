import { AuthSuccessScreen } from '../components/AuthSuccessScreen'

export function InsuranceCoordinatorSuccessPage() {
  return (
    <AuthSuccessScreen
      role="insurance_coordinator"
      loginPath="/insurance-coordinator"
      message="Your coordinator account has been authenticated successfully."
      continueTo="/coordinator/dashboard"
    />
  )
}
