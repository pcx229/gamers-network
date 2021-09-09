
import {io} from 'socket.io-client'

export function ChatSocket(room) {

	const socket = io((process.env.REACT_APP_SERVER_URL + '/'), {
		path: '/api/room/chat',
		query: {room},
		autoConnect: true,
		withCredentials: true
	})

	return {
		SendMessage(message, response) {
			socket.emit('message', message, response)
		},
		GetMore(index) {
			socket.emit('more', index)
		},
		OnErrorListener(callback) {
			socket.on('error', callback)
			socket.on('connect_error', callback)
		},
		RemoveOnErrorListener(callback) {
			socket.off('error', callback)
			socket.off('connect_error', callback)
		},
		OnDisconnectedListener(callback) {
			socket.on('disconnect', callback)
		},
		RemoveOnDisconnectedListener(callback) {
			socket.off('disconnect', callback)
		},
		OnStatusListener(callback) {
			socket.on('status', callback)
		},
		RemoveOnStatusListener(callback) {
			socket.off('status', callback)
		},
		OnMessageListener(callback) {
			socket.on('message', callback)
		},
		RemoveOnMessageListener(callback) {
			socket.off('message', callback)
		},
		OnMoreListener(callback) {
			socket.on('more', callback)
		},
		RemoveOnMoreListener(callback) {
			socket.off('more', callback)
		},
		OnActiveMembersChangedListener(members) {
			members.list = []
			members.callback_joined = (activeMembers) => {
				if(Array.isArray(activeMembers)) {
					members.list = [ ...activeMembers, ...members.list]
				} else {
					members.list = [ activeMembers, ...members.list]
				}
				members.list = Array.from(new Set(members.list))
				members.callback(members.list)
			}
			members.callback_left = (activeMember) => {
				members.list = members.list.filter(m => (m !== activeMember))
				members.callback(members.list)
			}
			socket.on('user-joined', members.callback_joined)
			socket.on('user-left', members.callback_left)
		},
		RemoveOnActiveMembersChangedListener(members) {
			socket.off('user-joined', members.callback_joined)
			socket.off('user-left', members.callback_left)
		},
		Disconnect() {
			socket.disconnect()
		}
	}
}