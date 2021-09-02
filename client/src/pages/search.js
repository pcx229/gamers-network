import { Button, CircularProgress, Container, Icon, IconButton, TextField, Typography} from '@material-ui/core'
import React, {useEffect, useState, useRef} from 'react'
import FilterSearchResults from '../components/FilterSearchResults'
import queryString from 'query-string'
import {useLocation, useHistory} from 'react-router-dom'
import {rooms as searchRooms, peoples as searchPeoples} from '../services/searchAPI'
import RoomsList from '../components/SearchRoomsList'
import PeoplesList from '../components/SearchPeoplesList'

const FETCH_RESULTS_NUMBER = 10

const list = []
let filters = {}

export default function Search() {

	const [text, setText] = useState('')
	const filter = useRef()
	const [initFilter, setInitFilter] = useState(undefined)
	const history = useHistory()
	const [resultsRooms, setResultsRooms] = useState(undefined)
	const [resultsPeoples, setResultsPeoples] = useState(undefined)
	const [canLoadMore, setCanLoadMore] = useState(false)
	const [loading, setLoading] = useState(false)
	const [skip, setSkip] = useState(undefined)
	const location = useLocation()

	useEffect(() => {
		while(list.length > 0) list.pop()
		setResultsRooms(undefined)
		setResultsPeoples(undefined)
		filters = queryString.parse(location.search)
		setText(filters.text || '')
		setInitFilter(filters)
		setSkip({position: 0})
		return () => {
			while(list.length > 0) list.pop()
			filters = {}
		}
	}, [location])

	useEffect(() => {
		if(!skip) {
			return
		}
		setLoading(true)
		setCanLoadMore(false)
		if(filters) {
			if((filters.type || 'rooms') === 'rooms') {
				searchRooms(filters.text, filters.game, filters.platform, filters.min_participates, filters.max_participates, FETCH_RESULTS_NUMBER, skip.position)
					.then(res => {
						const results = res.data
						list.push(...results)
						setResultsRooms(list)
						if(results.length === FETCH_RESULTS_NUMBER) {
							setCanLoadMore(true)
						} else {
							setCanLoadMore(false)
						}
						setLoading(false)
					})
			} else {
				searchPeoples(filters.text, filters.game, filters.platform, filters.country, FETCH_RESULTS_NUMBER, skip.position)
					.then(res => {
						const results = res.data
						list.push(...results)
						setResultsPeoples(list)
						if(results.length === FETCH_RESULTS_NUMBER) {
							setCanLoadMore(true)
						} else {
							setCanLoadMore(false)
						}
						setLoading(false)
					})
			}
		}
	}, [skip])

	function onLoadMore() {
		setSkip({position: skip.position + FETCH_RESULTS_NUMBER})
	}

	function onTextChange(event) {
		setText(event.target.value)
	}

	function onSubmit() {
		history.push({
			pathname: 'search',
			search: queryString.stringify({
				text: text,
				...filter.current.data()
			})
		})
	}

	return (
		<Container maxWidth="md">
			<br />
			<Typography color="textPrimary" variant="h3" align="center">Search</Typography>
			<br />
			<TextField 
				value={text}
				onChange={onTextChange}
				placeholder="Enter a name of a room or person" 
				variant="outlined" 
				fullWidth
				InputProps={{
					endAdornment: <>
						<IconButton onClick={onSubmit}>
							<Icon>search</Icon>
						</IconButton>
					</>
				}} />
			<br />
			<FilterSearchResults ref={filter} init={initFilter} />
			<Container maxWidth="md" align="center">
				<div>
					{
						resultsRooms ? <RoomsList rooms={resultsRooms} /> : undefined
					}
					{
						resultsPeoples ? <PeoplesList peoples={resultsPeoples} /> : undefined
					}
					{
						loading ? 
							<CircularProgress /> 
							: 
							(!resultsRooms || resultsRooms.length === 0) && (!resultsPeoples || resultsPeoples.length === 0) ? <Typography color="textPrimary">No Results</Typography> : undefined
					}
					{
						canLoadMore ? <Button variant="outlined" color="primary" onClick={onLoadMore}>Load More</Button> : undefined
					}
				</div>
			</Container>
		</Container>
	)
}