
import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react'

function scrollIsBiggerThenView(list, direction) {
	switch(direction) {
	case 'btt':
	case 'ttb':
	{
		if(list.scrollHeight > list.clientHeight) {
			return true
		}
		return false
	}
	case 'ltr':
	case 'rtl':
	{
		if(list.scrollWidth > list.clientWidth) {
			return true
		}
		return false
	}
	default:
		return false
	}
}

function scrollAtTheEndOfTheList(list, direction) {
	switch(direction) {
	case 'btt':
	{
		if((list.scrollHeight-list.clientHeight)+list.scrollTop < 70) {
			return true
		}
		return false
	}
	case 'ttb':
	{
		if((list.scrollHeight-list.clientHeight)-list.scrollTop < 70) {
			return true
		}
		return false
	}
	case 'ltr':
	{
		if((list.scrollWidth-list.clientWidth)-list.scrollLeft < 70) {
			return true
		}
		return false
	}
	case 'rtl':
	{
		if((list.scrollWidth-list.clientWidth)+list.scrollLeft < 70) {
			return true
		}
		return false
	}
	default:
		return false
	}
}

function _RemoteList({
	nextItems, // async function that will fetch the next part of the list by the number of items and offset requested, should return an empty list if no more items are available -  async function next(count, offset) => Array of items or undefined
	getItemId, // get item id, function getItemId(item) => string id
	maxRequestItemsNumber, // number of items to request in each next fetch - number
	firstRequestedItemsNumber = undefined, // number of items to request at first time - number, undefined
	firstFillView = true, // fill all the view available free space when loading items for the first time - true, false
	horizontal = false, // change direction in the x axis - true, false
	reverse = false, // change direction in the y axis
	trigger = 'scroll', // what cause the list to update - button, scroll
	render, // the render of each item in the list - function render(item, position) => React component
	style = undefined, // list component style - style
	sortItems = (list) => list // a sorting function for the items after each fetch - function sort(list) => Array of items
}, ref) {

	const [list, setList] = useState([])
	const [loading, setLoading] = useState(false)
	const [requestLoadMore, setRequestLoadMore] = useState(false)
	const [canLoadMore, setCanLoadMore] = useState(true)
	const [position, setPosition] = useState({offset: undefined, count: undefined})
	const listRef = useRef()

	const direction = horizontal ? (reverse ? 'rtl' : 'ltr') : (reverse ? 'btt' : 'ttb')
	
	useImperativeHandle(ref, () => ({
		callback_next: (res) => { // a callback function for getting the next items after next function call results in undefined
			setList(oldList => sortItems([...oldList, ...res]))
			setCanLoadMore(res.length >= maxRequestItemsNumber)
			setLoading(false)
		}
	}))

	useEffect(() => {
		if(position.offset !== undefined && position.count !== undefined) {
			setLoading(true)
			nextItems(position.count, position.offset)
				.then((res) => {
					if(res !== undefined) {
						setList(oldList => sortItems([...oldList, ...res]))
						setCanLoadMore(res.length >= maxRequestItemsNumber)
						setLoading(false)
					}
				})
		}
		return () => {
			setLoading(false)
		}
	}, [position, maxRequestItemsNumber])

	useEffect(() => {
		if(requestLoadMore) {
			if(!loading) {
				setPosition(oldPosition => {
					return {offset: oldPosition.offset + oldPosition.count, count: maxRequestItemsNumber }
				})
			}
			setRequestLoadMore(false)
		}
	}, [requestLoadMore, loading, maxRequestItemsNumber])

	useEffect(() => {
		let count = firstRequestedItemsNumber || maxRequestItemsNumber
		setPosition({offset: 0, count })

		const scrollLoadMore = setInterval(() => {
			if(!canLoadMore || trigger !== 'scroll') {
				clearInterval(scrollLoadMore)
			} else if(scrollAtTheEndOfTheList(listRef.current, direction)) {
				setRequestLoadMore(true)
			}
		}, 1000)

		const firstFillViewLoadMore = setInterval(() => {
			if(!firstFillView || trigger !== 'button' || !canLoadMore || scrollIsBiggerThenView(listRef.current, direction)) {
				clearInterval(firstFillViewLoadMore)
			} else {
				setRequestLoadMore(true)
			}
		}, 1000)

		return () => {
			clearInterval(scrollLoadMore)
			clearInterval(firstFillViewLoadMore)
			setList([])
			setCanLoadMore(true)
			setRequestLoadMore(false)
		}
	}, [listRef, nextItems, maxRequestItemsNumber, firstRequestedItemsNumber, firstFillView, trigger, direction])

	function clickLoadMore() {
		setRequestLoadMore(true)
	}

	return (
		<div ref={listRef} 
			style={{
				...style,
				overflowY: ['ttb', 'btt'].includes(direction) ? 'scroll' : undefined,
				overflowX: ['rtl', 'ltr'].includes(direction) ? 'scroll' : undefined,
				display: 'flex',
				flexDirection: ('ttb' === direction) ? 'column' : 
					('btt' === direction) ? 'column-reverse' :
						('ltr' === direction) ? 'row' : 
							'row-reverse'}} > 
			{ list.map((item, index) => <div key={getItemId(item)}> {render(item, index)} </div>) }
			{
				listRef.current !== undefined && canLoadMore && !((firstFillView || trigger === 'scroll') && !scrollIsBiggerThenView(listRef.current, direction)) ?
					trigger === 'button' ?
						<button onClick={clickLoadMore}>load more</button>
						:
						<p>Loading...</p>
					:
					undefined
			}
		</div>
	)
}

const RemoteList = forwardRef(_RemoteList)
export default RemoteList