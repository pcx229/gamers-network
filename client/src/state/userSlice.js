
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {profile} from '../services/authAPI'

export const fetchUser = createAsyncThunk('user/fetchUser', async (_, thunkApi) => {
	try {
		const response = await profile()
		return response.data
	} catch (err) {
		thunkApi.rejectWithValue(err.response.data)
	}
})

const initialState = {
	user: undefined,
	loading: true,
	error: undefined,
}

const userSlice = createSlice({
	name: 'user',
	initialState,
	reducers: {
		removeUser(state) {
			state.user = undefined
		},
	},
	extraReducers: {
		[fetchUser.pending]: (state) => {
			state.user = undefined
			state.loading = true
		},
		[fetchUser.fulfilled]: (state, action) => {
			state.user = action.payload
			state.loading = false
		},
		[fetchUser.rejected]: (state, action) => {
			state.error = action.payload
			state.loading = false
		},
	},
})

export const selectUser = (state) => state.user

export const {removeUser} = userSlice.actions

export default userSlice.reducer
