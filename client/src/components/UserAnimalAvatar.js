import Animal from 'react-animals'
import md5 from 'crypto-js/md5'
import {Avatar} from '@material-ui/core'
import React from 'react'

const animals = [
	'Alligator', 
	'anteater', 
	'armadillo', 
	'aurochs', 
	'axolotl', 
	'badger', 
	'bat', 
	'beaver', 
	'buffalo', 
	'camel', 
	'capybara', 
	'chameleon', 
	'cheetah', 
	'chinchilla', 
	'chipmunk', 
	'chupacabra', 
	'cormorant', 
	'coyote', 
	'crow', 
	'dingo', 
	'dinosaur', 
	'duck', 
	'elephant', 
	'ferret', 
	'fox', 
	'frog', 
	'giraffe', 
	'gopher', 
	'grizzly', 
	'hedgehog', 
	'hippo', 
	'hyena', 
	'ibex', 
	'ifrit', 
	'iguana', 
	'jackal', 
	'jackalope', 
	'kangaroo', 
	'koala', 
	'kraken', 
	'leopard', 
	'lemur', 
	'liger', 
	'loris', 
	'manatee', 
	'mink', 
	'monkey', 
	'moose', 
	'narwhal', 
	'Nyan Cat', 
	'orangutan', 
	'otter', 
	'panda', 
	'penguin', 
	'platypus', 
	'pumpkin', 
	'python', 
	'quagga', 
	'rabbit', 
	'raccoon', 
	'rhino', 
	'sheep', 
	'shrew', 
	'skunk', 
	'squirrel', 
	'tiger', 
	'turtle', 
	'walrus', 
	'wolf', 
	'wolverine', 
	'wombat'
]

const colors = [
	'red', 
	'orange', 
	'yellow', 
	'green', 
	'purple', 
	'teal'
]

function UserAnimalAvatar({src, username, size, rounded, square}) {

	if(src !== undefined && src !== '') {
		return <Avatar alt="user image" style={size ? {width: size, height: size} : undefined} variant={(rounded ? 'rounded' : (square ? 'square' : undefined))} src={src} />
	}

	const k = parseInt(md5(username).toString(), 16)
	const name = animals[Math.abs(k % animals.length)]
	const color = colors[Math.abs(k / animals.length % colors.length)]
	return (
		<div style={{overflow: 'hidden', width: 'min-content', borderRadius: (rounded || (!rounded && !square)) ? size : undefined}}>
			<Animal name={name} color={color} size={size} rounded />
		</div>
	)
}
export default UserAnimalAvatar