const getSignupTemplate = (name, couponCode = 'FESTIVE50') => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Sparklers Premium Showroom</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0a0b10; color: #ffffff; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #12131a; border-radius: 8px; overflow: hidden; border: 1px solid #d4af37; }
        .banner { background: linear-gradient(135deg, #0a0b10 0%, #3a0007 50%, #d4af37 100%); text-align: center; padding: 40px 20px; border-bottom: 2px solid #d4af37; }
        .banner h1 { margin: 0; color: #d4af37; font-size: 28px; text-transform: uppercase; letter-spacing: 2px; text-shadow: 0 0 10px rgba(212, 175, 55, 0.6); }
        .banner p { color: #ffaa44; font-size: 14px; margin-top: 10px; }
        .content { padding: 40px 30px; text-align: center; }
        .welcome-msg { font-size: 22px; color: #ffffff; margin-bottom: 20px; }
        .welcome-desc { font-size: 15px; color: #a0a5c0; line-height: 1.6; margin-bottom: 30px; }
        .coupon-box { background: rgba(212, 175, 55, 0.1); border: 2px dashed #d4af37; padding: 20px; border-radius: 6px; display: inline-block; margin-bottom: 30px; }
        .coupon-box span { display: block; font-size: 12px; color: #a0a5c0; text-transform: uppercase; letter-spacing: 1px; }
        .coupon-code { font-size: 24px; font-weight: bold; color: #ff4500; letter-spacing: 2px; margin-top: 5px; }
        .cta-btn { background: linear-gradient(to right, #ff4500, #d4af37); color: #ffffff !important; text-decoration: none; padding: 12px 30px; font-weight: bold; border-radius: 30px; display: inline-block; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(255, 69, 0, 0.4); }
        .footer { background-color: #07080c; padding: 25px; text-align: center; border-top: 1px solid #1c1d26; font-size: 12px; color: #5f6377; }
        .footer a { color: #d4af37; text-decoration: none; }
        .socials { margin-bottom: 15px; }
        .socials a { display: inline-block; margin: 0 8px; color: #a0a5c0; font-size: 14px; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="banner">
          <h1>✨ SPARKLERS PREMIUM ✨</h1>
          <p>Your Ultimate Festival Fireworks Partner</p>
        </div>
        <div class="content">
          <div class="welcome-msg">Hello, ${name}!</div>
          <div class="welcome-desc">
            Welcome to Sparklers Premium Fireworks Showroom, where we bring your celebrations to life with the most vibrant lights, sounds, and spectacles. Your account is ready! To celebrate your signup, we've loaded a special festive gift onto your account.
          </div>
          <div class="coupon-box">
            <span>Use code at checkout for 10% off</span>
            <div class="coupon-code">${couponCode}</div>
          </div>
          <div>
            <a href="#" class="cta-btn">Start Shopping Now</a>
          </div>
        </div>
        <div class="footer">
          <div class="socials">
            <a href="#">Facebook</a> | <a href="#">Instagram</a> | <a href="#">Twitter</a>
          </div>
          <p>&copy; 2026 Sparklers Premium. All rights reserved.</p>
          <p>Want to change how you receive these emails? You can <a href="#">unsubscribe</a> anytime.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const getOTPTemplate = (otp) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification - Sparklers Premium</title>
      <style>
        body { font-family: Arial, sans-serif; background-color: #0a0b10; color: #ffffff; margin: 0; padding: 0; }
        .container { max-width: 500px; margin: 40px auto; background-color: #12131a; border-radius: 8px; border: 1px solid #d4af37; overflow: hidden; }
        .banner { background-color: #0d0e15; padding: 25px; text-align: center; border-bottom: 1px solid #1c1d26; }
        .banner h1 { color: #d4af37; margin: 0; font-size: 22px; text-transform: uppercase; letter-spacing: 2px; }
        .content { padding: 40px 30px; text-align: center; }
        .otp-title { font-size: 18px; margin-bottom: 20px; color: #e2e8f0; }
        .otp-code { font-size: 32px; font-weight: bold; color: #ff4500; letter-spacing: 5px; padding: 15px 30px; background-color: rgba(255, 69, 0, 0.05); border: 1px solid rgba(255, 69, 0, 0.2); border-radius: 4px; display: inline-block; margin-bottom: 25px; }
        .otp-warning { font-size: 13px; color: #718096; line-height: 1.5; }
        .footer { background-color: #07080c; padding: 20px; text-align: center; font-size: 11px; color: #5f6377; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="banner">
          <h1>Sparklers Premium</h1>
        </div>
        <div class="content">
          <div class="otp-title">One-Time Password (OTP) Verification</div>
          <p style="color: #a0aec0; font-size: 14px; margin-bottom: 25px;">Please enter the verification code below on the website to verify your account or complete your action.</p>
          <div class="otp-code">${otp}</div>
          <div class="otp-warning">This code is valid for 10 minutes. If you did not request this, please ignore this email.</div>
        </div>
        <div class="footer">
          <p>&copy; 2026 Sparklers Premium. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  getSignupTemplate,
  getOTPTemplate,
};
