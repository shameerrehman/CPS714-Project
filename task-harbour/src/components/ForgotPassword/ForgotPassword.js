import { useState } from 'react';
import './forgotPassword.css';

function ForgotPassword() {
  const [formData, setFormData] = useState({
    username: '',
    task: 'initiate',
  });
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    fetch('https://3mtotetvonmshmec7onxkpy76m0wuesj.lambda-url.us-east-1.on.aws/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (response.status === 200) {
          setIsEmailSent(true);
          console.log('Password reset email sent email for user:', formData.username);
          window.location.href = '/confirm-code';
        } else {
          // Handle errors or display a message to the user
          console.log(response);
          console.error('Error during password reset:', response.status);
        }
      })
  };

  return (
    <div className="ForgotPassword">
      <h1>Forgot Password</h1>
      {isEmailSent ? (
        <div>A link to reset your password has been sent to your email address.</div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className='row'>
            <input
              type="text"
              placeholder="Username"
              required={true}
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
            />
          </div>
          <div className='submit'>
            <button type="submit">Send Reset Link</button>
          </div>
        </form>
      )}
      <div className='signin'><a onClick={() => { window.location.href = '/signin' }}> &lt;-- Back to signin </a></div>
      <div className='copyright'>Copyright © TaskHarbour </div>
    </div>
  );
}

export default ForgotPassword;
