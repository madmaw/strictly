import { PersonDetailsForm } from './person_details_form'

export function install() {
  return function () {
    return <PersonDetailsForm />
  }
}
