import React, {useState, useEffect, useRef} from 'react'
import { io, Socket } from 'socket.io-client';
import Message from './Message';
import { CSSProperties } from 'styled-components';
import { User } from '../types';
import WhitelistEntry from './WhiteListEntry';
import PopupChat from './PopupChat';

interface MessageObj {
    id: number;
    name: string;
    text: string;
    roomId: number;
}

interface Props {
    name: string;
    roomId: number;
    roomName: string;
    socket: Socket | undefined;
    leaveRoom: (roomName:string) => void;
    changeComponent: (component: string) => void;
}

const Chat:React.FC<Props> = ({name, roomId, roomName, socket, leaveRoom, changeComponent}) => {

    const [messages, setMessages] = useState<MessageObj []>([]);
    const [whitelist, setWhitelist] = useState<User[]>([]);
    const [messageText, setMessageText] = useState<string>("");

    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

    const [typing, setTyping] = useState<string>("");
    const [hover, setHover] = useState<boolean>(false);
    const [adminText, setAdminText] = useState<string>("");
    const [adminButton, setAdminButton] = useState<string>("");

    const Container: CSSProperties = {
        width: '100%',
        height:'100%',

        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around',
    }
    const middleBlock: CSSProperties = {
        width: '98%',
        height:'90%',
        margin: '5px',

        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
    }
    const topBar: CSSProperties = {
        width: '90%',
        height:'5%',
        margin: '5px',

        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
    }
    const rightBlock: CSSProperties = {
        flexGrow: '1',
        height:'90%',
        margin: '15px',

        background: 'rgba(0, 0, 0, 0.6)',
        border: '2px solid #fff',
        borderRadius: '15px',

        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
    }
    const leftBlock: CSSProperties = {
        width: '70%',
        height:'95%',
        margin: '5px',

        // backgroundColor: 'red',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around',
    }

    const displayBox: CSSProperties = {
        width: '90%', height: '80%',
        margin: '10px',
        padding: '20px',
        borderRadius: '30px',
        border: '2px solid #fff', backgroundColor: '#000',
        display: 'flex',
        flexDirection: 'column', justifyContent: 'flex-end',
        overflowY: 'auto', //MARCHE PAS
        wordWrap: 'break-word',
    }
    const typingBox: CSSProperties = {
        marginLeft: '20px',
        width: '60%', height: '8%',
    }
    const typingStyle: CSSProperties = {
        color:'white', fontSize: '18px',
    }
    const inputBox: CSSProperties = {
        width: '95%', height: '8%',
        margin: '10px',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
    }
    const inputBar: CSSProperties = {
        borderRadius: '30px', width: '80%',
        border: '2px solid #fff', backgroundColor: '#000',
        fontSize: '20px', color: '#fff',
    }
    const inputButton: CSSProperties = {
        borderRadius: '30px', width: '15%',
        border: '2px solid #fff', backgroundColor: '#000',
        fontSize: '20px', fontWeight: '500', color: '#fff',
        cursor: hover ? 'pointer' : 'auto',
    }
    const leaveButton: CSSProperties = {
        borderRadius: '30px', width: '15%',
        border: '2px solid #fff', backgroundColor: '#000',
        fontSize: '20px', fontWeight: '500', color: '#fff', textAlign: 'center',
        cursor: hover ? 'pointer' : 'auto',
    }
    const RoomName: CSSProperties = {
        fontSize: '48px', fontWeight:'800', color: '#fff',
    }

    useEffect(() => {
        socket?.emit('findRoomMessages', {roomId: roomId}, (response: MessageObj[]) => {
        setMessages(response);
        });
        socket?.emit('getWhitelist', {roomName: roomName}, () => {
            });

        socket?.on('message', (message: MessageObj) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        });

        socket?.on('whitelist', (users: User[]) => {
            setWhitelist(users);
        })

        socket?.on('kickUser', () => {
            changeComponent('home');
        })

        return () => {
            socket?.off('message');
        };

    }, []);


socket?.on('typing', ({name, isTyping}) => {
   if (isTyping) {
    setTyping(name + " is typing...");
   } else {
    setTyping("");
   }
})

const emitTyping = () => {
    if (!typing)
        socket?.emit('typing', { isTyping: true });
    setTimeout(() => {socket?.emit('typing', {isTyping: false})}, 2000);
}

const sendMessage = async () => {
    console.log(messageText);
    socket?.emit('createMessage', { name: name, text: messageText, room: roomId, roomName: roomName},
    (response: MessageObj) => {
        setMessageText("");
    })
    socket?.on('error', (error: any) => {
        console.error('Socket.IO connection error:', error);
      });
}

const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText)
        sendMessage();
}

const handleTyping = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessageText(event.target.value);
    emitTyping();
};

const handleHover = () => {
    setHover(!hover);
};

const adminType = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAdminText(event.target.value);
}
const adminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminButton === '+')
        socket?.emit('promoteAdmin', {target : adminText, roomName: roomName});
    else if (adminButton === '-')
        socket?.emit('demoteAdmin', {target : adminText, roomName: roomName});
    else if (adminButton === 'ban')
        socket?.emit('ban', {target : adminText, roomName: roomName});
    else if (adminButton === 'unban')
        socket?.emit('unban', {target : adminText, roomName: roomName});
}

    const handleUserClick = (user: User, event: React.MouseEvent<HTMLSpanElement>) => {
        setSelectedUser(user);
        setPopupPosition({ x: event.clientX, y: event.clientY });
    };

    return (
        <div style={Container}>
            <div style={topBar}>
                {/* NAVBAR DU CHAT */}
                <span style={RoomName}>{roomName}</span>
                <div style={leaveButton} onMouseEnter={handleHover} onMouseLeave={handleHover} onClick={() => leaveRoom(roomName)}>LEAVE ROOM</div>
                <form onSubmit={adminSubmit}>
                    <input value={adminText}
                     onChange={adminType}></input>
                    <button onClick={() => {setAdminButton('+')}}>+</button>
                    <button onClick={() => {setAdminButton('-')}}>-</button>
                    <button onClick={() => {setAdminButton('ban')}}>ban</button>
                    <button onClick={() => {setAdminButton('unban')}}>unban</button>
                </form>
            </div>
            <div style={middleBlock}>
                <div style={leftBlock}>
                    <div style={displayBox}>
                        {messages.map((message) => <Message message={message} key={message.id}/>)}
                    </div>
                    <div style={typingBox}>
                        {(typing) ? <div style={typingStyle}>{typing}</div> : null}
                    </div>
                    <form  style={inputBox} onSubmit={handleSubmit}>
                        <input style={inputBar}  value={messageText} onChange={handleTyping}></input>
                        <button style={inputButton} onMouseEnter={handleHover} onMouseLeave={handleHover}>SEND</button>
                    </form>
                </div>
                <div style={rightBlock}>
                    {whitelist.map((user) => <WhitelistEntry user={user} handleUserClick={handleUserClick} key={user.id}/>)}
                </div>
                <div>
                 {selectedUser && <PopupChat user={selectedUser} position={popupPosition} setSelectedUser={setSelectedUser} socket={socket} roomName={roomName}/>}
                </div>
            </div>
        </div>
    );
}

export default Chat;
