
import React from 'react'
import ReactDOM from 'react-dom'

import {Provider} from 'react-redux'
import store from './state/store'

import App from './App'

import DateMomentUtils from '@date-io/moment'
import { MuiPickersUtilsProvider } from '@material-ui/pickers'

ReactDOM.render(
	<Provider store={store}>
		<MuiPickersUtilsProvider utils={DateMomentUtils}>
			<App />
		</MuiPickersUtilsProvider>
	</Provider>,
	document.getElementById('root'),
)
