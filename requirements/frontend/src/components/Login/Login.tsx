import React, {useState} from 'react'
import '../home/Home.css'
import { CSSProperties } from 'styled-components';
import KingPong from './../../img/King_Pong.svg'
import Logo42 from './../../img/42_Logo.png'
import { useNavigate } from "react-router-dom"


interface Props {
    updateToken: (token: string) => void;
}

const Login:React.FC<Props> = ({updateToken}) => {

    const [hover, setHover] = useState<boolean>(false);
    const navigate = useNavigate();

    const CenterDiv: CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    }

    const ImageStyle: CSSProperties = {
        width: '70%',
        height: '70%',
    }

    const LogoStyle: CSSProperties = {
        width: '40px',
        height: '40px',
        marginRight: '10px'
    }

    const handleHover = () => {
        setHover(!hover);
    };

    const handleSubmit = () => {
        navigate('/home');
        
    };

    return (
        <div className="baground">
	<h1>TESTING</h1>
            <div style={CenterDiv}>
            <img src={KingPong} alt="King Pong"  style={ImageStyle} />
            <img src={KingPong} alt="King Pong"  style={ImageStyle} />
            <img src={KingPong} alt="King Pong"  style={ImageStyle} />
            <img src={KingPong} alt="King Pong"  style={ImageStyle} />
            <img src={KingPong} alt="King Pong"  style={ImageStyle} />
            <button className='btn-42' onMouseEnter={handleHover} onMouseLeave={handleHover} onClick={handleSubmit}>
                Log with
                <img src={Logo42} alt="Logo 42" style={LogoStyle} />
            </button>
            </div>
        </div>
    )
}

export default Login
