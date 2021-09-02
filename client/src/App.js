
import React from 'react'
import {
	Router,
	Switch,
	Route,
} from 'react-router-dom'
import {createBrowserHistory} from 'history'

import {useEffect} from 'react'

import {useSelector, useDispatch} from 'react-redux'

import {fetchUser, selectUser} from './state/userSlice'

import PrivateRoute from './components/PrivateRoute'

import Home from './pages/home'
import Login from './pages/login'
import Signup from './pages/signup'
import ForgotPassword from './pages/forgot_password'
import ResetPassword from './pages/reset_password'
import Contact from './pages/contact'
import Room from './pages/room'
import Search from './pages/search'
import Profile from './pages/profile'
import Invite from './pages/invite'

import {createMuiTheme, ThemeProvider} from '@material-ui/core'
import MenuWithFooterAndBorderLayout from './components/MenuWithFooterAndBorderLayout'
import Logout from './pages/logout'

const darkTheme = createMuiTheme({
	palette: {
		type: 'dark',
		primary: {
			main: '#ff4400',
		}
	}
})

const history = createBrowserHistory()

export default function App() {
	const {user, loading} = useSelector(selectUser)
	const dispatch = useDispatch()

	useEffect(() => {
		dispatch(fetchUser())
	}, [dispatch])

	const isLoggedIn = (user !== undefined)

	if (loading) {
		return <></>
	}

	return (
		<Router history={history}>
			<MenuWithFooterAndBorderLayout>
				<ThemeProvider theme={darkTheme}>
					<Switch>
						<PrivateRoute access={!isLoggedIn} redirect="/" path="/signup" component={Signup} />
						<PrivateRoute access={!isLoggedIn} redirect="/" path="/login" component={Login} />
						<PrivateRoute access={!isLoggedIn} redirect="/" path="/reset-password/:code" component={ResetPassword} />
						<PrivateRoute access={!isLoggedIn} redirect="/" path="/forgot-password" component={ForgotPassword} />
						<PrivateRoute access={isLoggedIn} redirect="/" path="/logout" component={Logout} />
						<Route path="/contact" component={Contact} />
						<Route path="/room/:id" component={Room} />
						<Route path="/search" component={Search} />
						<Route path="/profile/:id" component={Profile} />
						<Route path="/invite/:roomId/:code" component={Invite} />
						<Route exact path="/" component={Home} />
						<Route component={() => (window.location = '/404.html')} />
					</Switch>
				</ThemeProvider>
			</MenuWithFooterAndBorderLayout>
		</Router>
	)
}
