import React, {useState, useEffect, useRef} from 'react'
import { CSSProperties } from 'react'

interface Props {
    changeComponent: (component: string) => void;
}

const CreateAccount:React.FC<Props> = ({changeComponent}) => {

    const [inputLog, setInputLog] = useState<string>('');
    const [inputPass, setInputPass] = useState<string>('');
    const [confirmPass, setConfirmPass] = useState<string>('');
    const [hover, setHover] = useState<boolean>(false);
    const [click, setClick] = useState<string>('');

    const Container : CSSProperties = {   
        height: '70%', width: '30%',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderRadius: '30px',

        display: 'flex', flexDirection: 'column', justifyContent: 'space-around', alignContent:'center', 

        fontWeight: '800', fontFamily: 'Montserrat, sans-serif', color: '#FFFFFF',
    }
    const Title : CSSProperties = {   
        alignSelf: 'center', fontSize: '40px',
    }
    const Input : CSSProperties = {   
        display: 'flex', flexDirection: 'column' , justifyContent: 'space-around', 
        paddingTop: '10%',
        paddingBottom: '10%',
        width: '100%',
        height: '100%',
        position: 'relative',
        alignItems: 'center',
    }
    const InputBox : CSSProperties = {   
        width: '56%',
        height: '1%',
        borderRadius: '15px',
        padding: '20px 30px',
        fontSize: '25px',
        border: 'none',
        boxShadow: 'inset 0 0 7px black',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        zIndex: 1,
    }
    const BoxCreate : CSSProperties = {   
        backgroundColor: 'rgba(0, 255, 0, 0.8)',
        width: '65%', height: '7%', borderRadius: '5px',
        fontWeight: '800', fontFamily: 'Montserrat, sans-serif', color: '#fff', fontSize: '20px',
        
        border: 'none',
        textAlign: 'center',
        zIndex: 1, cursor: hover ? 'pointer' : 'auto',
    }
    const Box42 : CSSProperties = {   
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        width: '65%', height: '7%', borderRadius: '5px',
        textAlign: 'center',
        border: 'none',
        fontSize: '20px', fontWeight: '600', fontFamily: 'Montserrat, sans-serif', color: '#000',
        zIndex: 1, cursor: hover ? 'pointer' : 'auto',
    }
    const BoxReturn : CSSProperties = {   
        backgroundColor: 'rgba(150, 150, 150, 0.8)',
        width: '65%', height: '7%', borderRadius: '5px',
        textAlign: 'center',
        border: 'none',
        fontSize: '20px', fontWeight: '600', fontFamily: 'Montserrat, sans-serif', color: '#fff',
        zIndex: 1, cursor: hover ? 'pointer' : 'auto',
    }
    const inputRef = useRef<HTMLInputElement>(null);

    const handleLog = (event:React.ChangeEvent<HTMLInputElement>) => {
        setInputLog(event.target.value);
    };
    const handlePass = (event:React.ChangeEvent<HTMLInputElement>) => {
        setInputPass(event.target.value);
    };
    const handleConfirm = (event:React.ChangeEvent<HTMLInputElement>) => {
        setConfirmPass(event.target.value);
    };
    const handleHover = () => {
        setHover(!hover);
    };
    const handleClick = (button: string) => {
        setClick(button);
    };
    const handleSubmit = (e : React.FormEvent) => {
        e.preventDefault();
        setInputLog('');
        setInputPass('');
        setConfirmPass('');
        if (click === 'return')
            changeComponent('login');
        if (click === '42')
            console.log('LOG WITH 42');
        if (click === 'create')
        {
            //ENVOYER AU BACK
            console.log(inputLog);
            console.log(inputPass);
            console.log(confirmPass);
            //SI LE BACK VALIDE
            changeComponent('play');
        }
    };

  return (
    <div style={Container}>
        <form style={Input} onSubmit={handleSubmit}>
            <span style={Title}>King Pong</span>
            <input ref={inputRef} style={InputBox} type='input' placeholder='Select Username' value={inputLog} onChange={handleLog}/>
            <input style={InputBox} type='input' placeholder='Select Password' value={inputPass} onChange={handlePass}/>
            <input style={InputBox} type='input' placeholder='Confirm Password' value={inputPass} onChange={handleConfirm}/>
                <button style={BoxCreate} onMouseEnter={handleHover} onMouseLeave={handleHover} onClick={() => handleClick('create')}>Create account</button>
            <span>Or</span>
            <button style={Box42} onMouseEnter={handleHover} onMouseLeave={handleHover} onClick={() => handleClick('42')}>Sign up with 42</button>            
            <button style={BoxReturn} onMouseEnter={handleHover} onMouseLeave={handleHover} onClick={() => handleClick('return')}>Return</button>
        </form>
    </div>
  )
}

export default CreateAccount
