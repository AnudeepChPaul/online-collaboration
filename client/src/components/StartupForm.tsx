import React from 'react'
import PropTypes, { InferProps } from 'prop-types'


function StartupForm({ submitForm }: InferProps<typeof StartupForm.propTypes>) {

  return (
    <div className="username-enter-form-wrapper">
      <form onSubmit={evt => submitForm( evt )} className="username-enter-form">
        <input name="name" className="username-enter-form-input"/>

        <button type="submit" className="username-enter-form-button"> Begin !</button>
      </form>
    </div>
  )
}

StartupForm.propTypes = {
  submitForm: PropTypes.func.isRequired
}

export default StartupForm