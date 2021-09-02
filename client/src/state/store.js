
import {configureStore} from '@reduxjs/toolkit'
import userReducer from './userSlice'
import roomReducer from './roomSlice'
import profileReducer from './profileSlice'

const store = configureStore({
	reducer: {
		user: userReducer,
		room: roomReducer,
		profile: profileReducer
	},
})

export default store
