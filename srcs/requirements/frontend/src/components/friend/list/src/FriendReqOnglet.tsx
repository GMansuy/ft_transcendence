import React from 'react'
import { User } from '../../../types';
import '../css/FriendReqOnglet.css'
import { useState, useEffect } from 'react';
import { CSSProperties } from 'react';

type propsRem = {
	onRemove: () => void;
	sender: User;
	token: string
	update: () => void;
}

const FriendReqOnglet = ({ sender, token, onRemove, update }: propsRem) => {

	const padd: CSSProperties = {
		paddingLeft: '7%',
		overflowX: 'auto',
		textShadow: 'none'
	}

	const handleYes = async () => {
		const bear = 'Bearer ' + token
		const req = 'http://localhost:5000/friend/accept/' + sender.id
		await fetch(req, { method: "PUT", headers: { 'Authorization': bear } })
		onRemove()
		update()
	}

	const handleNo = async () => {
		const bear = 'Bearer ' + token
		console.log('token', token)
		const req = 'http://localhost:5000/friend/refuse/' + sender.id
		await fetch(req, { method: "DELETE", headers: { 'Authorization': bear } })
		onRemove()
	}


	return (
		<div className='containerFriendReqOnglet'>
			<div style={padd} className='nameText'>{sender.username}</div>
			<div className='containerCheck'>
				<div className='yesButton' title='accept' onClick={handleYes} />
				<div className='noButton' title='refuse' onClick={handleNo} />
				<div className='bloqueButton' title='block' />
			</div>
		</div>
	)
}

export default FriendReqOnglet