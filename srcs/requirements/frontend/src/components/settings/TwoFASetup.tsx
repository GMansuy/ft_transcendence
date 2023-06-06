import { useState, useEffect, ChangeEvent } from 'react';
import AuthCode from 'react-auth-code-input';

const TwoFASetup = ({ onVerification }: { onVerification: (isVerified: boolean) => void }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [twoFACode, setTwoFACode] = useState('');
  const [isVerified, setIsVerified] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("http://localhost:5000/twofa/generate-2fa-secret", {
        method: "GET",
        credentials: 'include'
      });

      if(response.ok) {
        const data = await response.text();
        setQrCodeUrl(data);
      } else {
        console.error("Error fetching 2FA secret:", response.status, response.statusText);
      }
    }

    fetchData();
  }, []);

  const handleCodeChange = (code: string) => {
    setTwoFACode(code);
    if (code.length < 6)
      setErrorMessage(null);
  };

  const verifyCode = async () => {
    try {
      const response = await fetch("http://localhost:5000/twofa/confirm-enable-2fa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: twoFACode }),
        credentials: 'include'
      });
      if(response.ok) {
        setIsVerified(true);
        onVerification(true);
      } else {
        setErrorMessage('Invalid 2FA code')
      }
    } catch (error) {
      console.error(error);
      alert('An Error occured verifying the 2FA code');
    }
  };

  return (
    <div>
      {!isVerified && qrCodeUrl && (
        <>
          <p className='text bold' style={{textAlign: 'center'}}>Please add this QR code to your Two-Factor Authentication app. 
          The two-factor authentication will be activated once the code is validated.</p>
          <div className='twofa-container'>
          <img src={qrCodeUrl} className="qrCodeImage" width={150} height={150} alt="QR code" />
          <AuthCode containerClassName="auth-code-container" inputClassName="auth-code-input-cell-settings" allowedCharacters="numeric" onChange={handleCodeChange}/>
          <button className='button-2fa' onClick={verifyCode}>Verify Code</button>
          {errorMessage && <p className="text bold neon-red twofa-error">{errorMessage}</p>}
          </div>
        </>
      )}
    </div>
  );
};

export default TwoFASetup;

