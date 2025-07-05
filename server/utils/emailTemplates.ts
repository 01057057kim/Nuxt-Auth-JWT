export function verificationEmailTemplate(code: string) {
  return {
    subject: 'Verify your email',
    text: `Your verification code is: ${code}\nThis code will expire in 15 minutes.`,
    html: `<div style=\"font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background: #fafafa;\">
      <h2 style=\"color: #ff9800;\">Welcome to Our App!</h2>
      <p>Thank you for registering. Please use the code below to verify your email address:</p>
      <div style=\"font-size: 2em; font-weight: bold; color: #333; letter-spacing: 2px; margin: 20px 0;\">${code}</div>
      <p style=\"color: #888;\">This code will expire in 15 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
    </div>`
  }
}

export function resetEmailTemplate(code: string) {
  return {
    subject: 'Password Reset Request',
    text: `Your password reset code is: ${code}\nThis code will expire in 15 minutes.`,
    html: `<div style=\"font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background: #fafafa;\">
      <h2 style=\"color: #ff9800;\">Password Reset Request</h2>
      <p>We received a request to reset your password. Use the code below:</p>
      <div style=\"font-size: 2em; font-weight: bold; color: #333; letter-spacing: 2px; margin: 20px 0;\">${code}</div>
      <p style=\"color: #888;\">This code will expire in 15 minutes.</p>
      <p>If you did not request this, you can ignore this email.</p>
    </div>`
  }
}

export function passwordChangedTemplate() {
  return {
    subject: 'Password Changed Successfully',
    text: `Your password has been changed successfully. If you did not do this, please contact support immediately.`,
    html: `<div style=\"font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background: #fafafa;\">
      <h2 style=\"color: #4caf50;\">Password Changed</h2>
      <p>Your password has been changed successfully.</p>
      <p>If you did not do this, please contact support immediately.</p>
    </div>`
  }
} 