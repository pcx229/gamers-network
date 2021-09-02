
import React from 'react'
import {
	Redirect,
	Route
} from 'react-router-dom'

function PrivateRoute({component, access, redirect, ...rest}) {
	const MyComponent = component
	return (
		<Route
			{...rest}
			render={(props) => access === true
				? <MyComponent {...props} />
				: <Redirect to={{pathname: redirect, state: {from: props.location}}} />}
		/>
	)
}

export default PrivateRoute
