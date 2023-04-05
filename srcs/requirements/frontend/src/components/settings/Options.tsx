import {useState, ChangeEvent} from 'react';

import reveal_svg from '../../assets/img/reveal.svg'
import hide_svg from '../../assets/img/hide.svg'

import {Cont} from '../container/container'

const SettingsUsername = () => {
	return (
		<>
			<p className='text bold'>Your current username :</p>
			
			<p className='text bold'>If you want to change, please enter a new username :</p>
		</>
	);
}

const SettingsAvatar = () => {
	return (
		<>
			<p className='text bold'>Current username :</p>
			<button className='text bold'>Change Avatar</button>
		</>
	);
}

const SettingsBlock = () => {
	return (
		<>
			<p className='text bold'>This is a list of blocked users :</p>
		</>
	);
}

const SettingsPassword = () => {

	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');

	const handleCurrentPasswordChange = (event : ChangeEvent<HTMLInputElement>) => {
		setCurrentPassword(event.target.value);
	}

	const handleNewPasswordChange = (event : ChangeEvent<HTMLInputElement>) => {
		setNewPassword(event.target.value);
	}

	const handleConfirmPasswordChange = (event : ChangeEvent<HTMLInputElement>) => {
		setConfirmPassword(event.target.value);
	}

	const [newPasswordType, setNewPasswordType] = useState("password"); // hide or visible password
	const [confirmPasswordType, setConfirmPasswordType] = useState("password");

	const toggleConfirmPassword =()=>{
		confirmPasswordType === "password" ? setConfirmPasswordType("text") : setConfirmPasswordType("password")
	  }

	const toggleNewPassword =()=>{
		newPasswordType === "password" ? setNewPasswordType("text") : setNewPasswordType("password")
	}

	return (
		<Cont alignItems='center' padding='10px' margin='10px' gap='10px' width='380px' height='90%'>
			<p className='text bold cyan-stroke'>Change password</p>
			<Cont gap='15px'>
			<div className='password'>
				<p className='text'>Current password</p>
				<input className="text bold password-input" type='password' value={currentPassword} placeholder="password" onChange={handleCurrentPasswordChange} />
			</div>
			<div className='password'>
				<p className='text'>Set new password</p>
				<input className="text bold password-input" type={newPasswordType} value={newPassword} placeholder="new password" onChange={handleNewPasswordChange} />
				<button className='btn-little' onClick={toggleNewPassword}>
					<img src={newPasswordType === "password" ? reveal_svg : hide_svg}></img>
				</button>
			</div>
			<div className='password'>
				<p className='text'>Confirm password</p>
				<input className="text bold password-input" type={confirmPasswordType} value={confirmPassword} placeholder="retype password" onChange={handleConfirmPasswordChange} />
				<button className='btn-little' onClick={toggleConfirmPassword}>
					<img src={confirmPasswordType === "password" ? reveal_svg : hide_svg}></img>
				</button>
			</div>
			</Cont>
			<button className='btn-little'><p className='text bold cyan-stroke'>CONFIRM</p></button>
		</Cont>
	);
}

const SettingsLock = () => {
	return (
		// <Cont minWidth='427px' minHeight='340px' width='427px' height='340px'> 
		<>
			<p className='text bold'>2F authentication</p>
		</>
		// </Cont>
	); // on garde le cont ici au cas ou
}

export {SettingsUsername,
		SettingsAvatar,
		SettingsBlock,
		SettingsPassword,
		SettingsLock};